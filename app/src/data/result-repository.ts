import type { SupabaseClient } from "@supabase/supabase-js";
import { DraftError } from "../domain/draft.ts";
import { readOwnResult, type OwnResult } from "../domain/result.ts";

export async function loadOwnResult(
  client: SupabaseClient,
  drawId: string,
  accountId: string,
): Promise<OwnResult> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      drawId,
    )
  )
    throw new DraftError("Este enlace de resultado no es válido.");
  try {
    const { data, error } = await client.rpc("get_my_draw_result", {
      p_draw_id: drawId,
      p_account_id: accountId,
    });
    if (error?.code === "42501")
      throw new DraftError(
        "No se ha podido verificar tu acceso. Entra con la cuenta del correo que figura en el grupo.",
      );
    if (error?.code === "PGRST202")
      throw new DraftError(
        "La consulta de resultados todavía no está disponible. Inténtalo más adelante.",
      );
    if (error)
      throw new DraftError(
        "No se ha podido abrir tu resultado. Comprueba tu conexión e inténtalo de nuevo.",
      );
    return readOwnResult(data);
  } catch (error) {
    throw error instanceof DraftError
      ? error
      : new DraftError(
          "No se ha podido abrir tu resultado. Comprueba tu conexión e inténtalo de nuevo.",
        );
  }
}
