import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState, Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import { AUTH_CALLBACK_PATH, AuthFlowError } from "../domain/auth";
import { clearAuthCallbackCache, exchangeAuthCallback } from "./callback";
import { supabase, supabaseConfig } from "./supabase";

export function authReturnUrl() {
  return Platform.OS === "web"
    ? new URL(AUTH_CALLBACK_PATH, window.location.origin).href
    : Linking.createURL(AUTH_CALLBACK_PATH, { scheme: "miamigoinvisible" });
}

type Auth = {
  session: Session | null;
  ready: boolean;
  busy: boolean;
  configured: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  completeSignIn: (url: string) => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    let revision = 0;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, next) => {
      if (_event === "SIGNED_OUT") clearAuthCallbackCache(client);
      revision++;
      if (active) {
        setSession(next);
        setReady(true);
      }
    });
    const initialRevision = revision;
    client.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (active && revision === initialRevision) {
          setSession(data.session);
          if (sessionError)
            setError(
              "No se ha podido recuperar la sesión. Vuelve a iniciar sesión.",
            );
        }
      })
      .catch(() => {
        if (active)
          setError(
            "No se ha podido recuperar la sesión. Comprueba tu conexión.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    const refresh = () => {
      if (AppState.currentState === "active") client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    };
    const listener =
      Platform.OS !== "web"
        ? AppState.addEventListener("change", refresh)
        : null;
    if (Platform.OS !== "web") refresh();
    return () => {
      active = false;
      subscription.unsubscribe();
      listener?.remove();
    };
  }, []);

  const completeSignIn = useCallback(async (url: string) => {
    if (!supabase)
      throw new AuthFlowError("El acceso con Google aún no está configurado.");
    await exchangeAuthCallback(supabase, url, authReturnUrl());
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase || !supabaseConfig || busy) return;
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      // Comprobación pública: evita dejar al usuario en un error externo si falta OAuth.
      const response = await fetch(`${supabaseConfig.url}/auth/v1/settings`, {
        headers: { apikey: supabaseConfig.key },
        signal: controller.signal,
      });
      if (!response.ok)
        throw new AuthFlowError(
          "No se ha podido conectar con el servicio de acceso.",
        );
      const settings = await response.json();
      if (!settings.external?.google)
        throw new AuthFlowError(
          "El acceso con Google todavía no está disponible. Puedes seguir explorando la demo.",
        );
      const redirectTo = authReturnUrl();
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (signInError || !data.url)
        throw new AuthFlowError(
          "No se ha podido iniciar el acceso con Google. Inténtalo de nuevo.",
        );
      if (Platform.OS === "web") window.location.assign(data.url);
      else {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo,
        );
        if (result.type === "success") await completeSignIn(result.url);
        else setError("Has cancelado el acceso. Puedes intentarlo de nuevo.");
      }
    } catch (cause) {
      setError(
        cause instanceof TypeError ||
          (cause instanceof Error && cause.name === "AbortError")
          ? "No se ha podido conectar. Comprueba tu conexión e inténtalo de nuevo."
          : cause instanceof AuthFlowError
            ? cause.message
            : "No se ha podido iniciar sesión.",
      );
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  };
  const signOut = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });
      if (signOutError) throw signOutError;
      setSession(null);
    } catch {
      setError(
        "No se ha podido cerrar la sesión. Comprueba tu conexión y vuelve a intentarlo.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Context.Provider
      value={{
        session,
        ready,
        busy,
        configured: !!supabase,
        error,
        signInWithGoogle,
        signOut,
        completeSignIn,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("Falta AuthProvider.");
  return value;
}
