import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthFlowError, authCodeFromCallback } from "../domain/auth.ts";

// React Strict Mode y el retorno nativo pueden procesar el mismo enlace a la vez.
// Un código OAuth solo se puede canjear una vez.
const pending = new WeakMap<SupabaseClient, Map<string, Promise<void>>>();
export function clearAuthCallbackCache(client: SupabaseClient) {
  pending.delete(client);
}
export function exchangeAuthCallback(
  client: SupabaseClient,
  url: string,
  expectedUrl: string,
) {
  const code = authCodeFromCallback(url, expectedUrl);
  const flowId = new URL(url).searchParams.get("sb_flow_id");
  let exchanges = pending.get(client);
  if (!exchanges) {
    exchanges = new Map();
    pending.set(client, exchanges);
  }
  const existing = exchanges.get(code);
  if (existing) return existing;
  const exchange = (async () => {
    const { data, error } = await client.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );
    if (error || !data.session) {
      throw new AuthFlowError(
        "No se ha podido recuperar tu sesión. Vuelve a entrar con Google desde este navegador o dispositivo.",
      );
    }
  })();
  exchanges.clear();
  exchanges.set(code, exchange);
  // Conservar solo el último canje correcto para un retorno nativo tardío.
  void exchange.catch(() => exchanges.delete(code));
  return exchange;
}
