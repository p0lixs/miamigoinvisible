import type { SupabaseClient } from "@supabase/supabase-js";
import type { Draw } from "../domain/draw.ts";
import {
  DraftError,
  cloudDraft,
  draftPayload,
  readDraftRow,
} from "../domain/draft.ts";

function storageError(error: unknown): DraftError {
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  const message =
    error && typeof error === "object" && "message" in error
      ? error.message
      : undefined;
  if (code === "22023" && message === "DRAW_IMPOSSIBLE")
    return new DraftError(
      "Con estas excepciones no existe una combinación válida. Revisa las reglas del grupo antes de volver a intentarlo.",
    );
  if (code === "22023" && message === "DRAW_LOCKED")
    return new DraftError(
      "Este sorteo ya está realizado y no se puede editar. Puedes copiarlo para preparar otro.",
    );
  if (code === "22023" && message === "DRAW_INCOMPLETE")
    return new DraftError(
      "Completa el título, el presupuesto y al menos tres participantes antes de sortear.",
    );
  if (code === "40001")
    return new DraftError(
      "Este borrador ha cambiado en otra pestaña o dispositivo. Actualiza tus sorteos y vuelve a abrirlo antes de guardar.",
    );
  if (["PGRST202", "PGRST205", "42P01"].includes(String(code)))
    return new DraftError(
      "El guardado en tu cuenta todavía no está disponible. Inténtalo más tarde.",
    );
  if (["42501", "PGRST301"].includes(String(code)))
    return new DraftError(
      "No se puede acceder a este borrador. Vuelve a iniciar sesión e inténtalo de nuevo.",
    );
  if (
    ["22023", "23503", "23505", "23514", "22P02", "22007", "22008"].includes(
      String(code),
    )
  )
    return new DraftError(
      "No se ha guardado el borrador. Revisa los datos, los correos y las excepciones.",
    );
  return new DraftError(
    "No se ha podido conectar con tus sorteos. Comprueba tu conexión e inténtalo de nuevo.",
  );
}

export function createDraftRepository(
  client: SupabaseClient,
  owner: { id: string; email: string },
  newId: () => string,
) {
  const retries = new Map<string, { fingerprint: string; requestId: string }>();
  const runRequests = new Map<string, string>();
  const repository = {
    async list(): Promise<Draw[]> {
      try {
        const { data, error } = await client
          .from("draws")
          .select(
            "id,title,description,budget_cents,currency,exchange_date,status,color,version,drawn_at,draw_participants:draw_participants!draw_participants_draw_id_fkey(id,name,email,position),draw_exclusions:draw_exclusions!draw_exclusions_draw_id_fkey(giver_id,recipient_id)",
          )
          .eq("owner_id", owner.id)
          .order("updated_at", { ascending: false });
        if (error) throw storageError(error);
        if (!Array.isArray(data)) throw storageError(null);
        return data.map((row) => readDraftRow(row, owner.email));
      } catch (error) {
        throw error instanceof DraftError ? error : storageError(error);
      }
    },
    async save(draw: Draw): Promise<Draw> {
      const payload = draftPayload(draw);
      const version = draw.version ?? 0;
      if (!Number.isSafeInteger(version) || version < 0)
        throw new DraftError(
          "La versión de este borrador no es válida. Vuelve a abrirlo.",
        );
      const fingerprint = JSON.stringify({ version, payload });
      let attempt = retries.get(draw.id);
      if (!attempt || attempt.fingerprint !== fingerprint) {
        attempt = { fingerprint, requestId: newId() };
        retries.set(draw.id, attempt);
      }
      try {
        const { data, error } = await client.rpc("save_draw_draft", {
          p_draw_id: draw.id,
          p_owner_id: owner.id,
          p_expected_version: version,
          p_request_id: attempt.requestId,
          p_draft: payload,
        });
        if (error) throw storageError(error);
        if (
          !data ||
          data.id !== draw.id ||
          !Number.isSafeInteger(data.version) ||
          data.version !== version + 1
        )
          throw storageError(null);
        retries.delete(draw.id);
        return cloudDraft(payload, draw.id, data.version, owner.email);
      } catch (error) {
        throw error instanceof DraftError ? error : storageError(error);
      }
    },
    async generate(draw: Draw): Promise<Draw> {
      if (!draw.version || !Number.isSafeInteger(draw.version))
        throw new DraftError(
          "Actualiza tus sorteos antes de realizar el sorteo.",
        );
      let requestId = runRequests.get(draw.id);
      if (!requestId) {
        requestId = newId();
        runRequests.set(draw.id, requestId);
      }
      try {
        const { data, error } = await client.rpc("generate_draw", {
          p_draw_id: draw.id,
          p_owner_id: owner.id,
          p_expected_version: draw.version,
          p_request_id: requestId,
        });
        if (error) throw storageError(error);
        if (
          !data ||
          data.id !== draw.id ||
          data.status !== "drawn" ||
          !Number.isSafeInteger(data.version) ||
          data.version < 2
        )
          throw storageError(null);
        // Recuperar metadatos actuales: un reintento puede partir de una vista
        // antigua. No atribuir la version nueva a datos antiguos del formulario.
        const current = (await repository.list()).find((d) => d.id === draw.id);
        if (!current || current.status !== "drawn") throw storageError(null);
        runRequests.delete(draw.id);
        return current;
      } catch (error) {
        throw error instanceof DraftError ? error : storageError(error);
      }
    },
  };
  return repository;
}
