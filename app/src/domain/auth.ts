export const AUTH_CALLBACK_PATH = "/auth/callback";
export class AuthFlowError extends Error {}

export function publicSupabaseConfig(url?: string, key?: string) {
  if (!url || !key?.startsWith("sb_publishable_")) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      parsed.pathname !== "/"
    )
      return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

// Nunca mostramos descripciones externas ni aceptamos un destino de redirección.
export function authCodeFromCallback(url: string, expectedUrl: string): string {
  let actual: URL;
  let expected: URL;
  try {
    actual = new URL(url);
    expected = new URL(expectedUrl);
  } catch {
    throw new AuthFlowError(
      "Este enlace de acceso no es válido. Vuelve a entrar con Google.",
    );
  }
  if (
    actual.protocol !== expected.protocol ||
    actual.host !== expected.host ||
    actual.pathname !== expected.pathname ||
    actual.username ||
    actual.password
  )
    throw new AuthFlowError(
      "El enlace de acceso no pertenece a esta aplicación.",
    );
  const fragment = new URLSearchParams(actual.hash.slice(1));
  const error = actual.searchParams.get("error") || fragment.get("error");
  if (error === "access_denied") {
    throw new AuthFlowError(
      "Has cancelado el acceso con Google. Puedes intentarlo de nuevo.",
    );
  }
  if (error)
    throw new AuthFlowError(
      "Google no ha podido completar el acceso. Inténtalo de nuevo.",
    );
  const codes = actual.searchParams.getAll("code");
  if (codes.length !== 1 || !codes[0] || codes[0].length > 4096) {
    throw new AuthFlowError(
      "Este enlace de acceso no es válido. Vuelve a entrar con Google.",
    );
  }
  return codes[0];
}
