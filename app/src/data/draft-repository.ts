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
  return {
    async list(): Promise<Draw[]> {
      try {
        const { data, error } = await client
          .from("draws")
          .select(
            "id,title,description,budget_cents,currency,exchange_date,status,color,version,draw_participants(id,name,email,position),draw_exclusions(giver_id,recipient_id)",
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
  };
}
