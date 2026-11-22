import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import {
  authCodeFromCallback,
  publicSupabaseConfig,
} from "../src/domain/auth.ts";
import { exchangeAuthCallback } from "../src/auth/callback.ts";

const callback = "https://app.example/auth/callback";
test("solo se admite configuración pública sin credenciales en la URL", () => {
  assert.deepEqual(
    publicSupabaseConfig(
      "https://project.supabase.co/",
      "sb_publishable_example",
    ),
    {
      url: "https://project.supabase.co",
      key: "sb_publishable_example",
    },
  );
  for (const url of [
    "",
    "http://project.supabase.co",
    "https://user:password@project.supabase.co",
    "https://project.supabase.co?key=value",
  ]) {
    assert.equal(publicSupabaseConfig(url, "sb_publishable_example"), null);
  }
  for (const key of [undefined, "sb_secret_example", "legacy-secret"]) {
    assert.equal(
      publicSupabaseConfig("https://project.supabase.co", key),
      null,
    );
  }
});

test("el retorno OAuth valida origen y ruta, rechaza tokens implícitos y oculta errores externos", () => {
  assert.equal(
    authCodeFromCallback(
      `${callback}?code=one-time-code&next=https://evil.example`,
      callback,
    ),
    "one-time-code",
  );
  for (const url of [
    callback,
    `${callback}?code=`,
    `${callback}?code=a&code=b`,
    `${callback}#access_token=token&refresh_token=token`,
    "https://evil.example/auth/callback?code=a",
    "https://app.example/otra?code=a",
  ]) {
    assert.throws(() => authCodeFromCallback(url, callback));
  }
  assert.throws(
    () =>
      authCodeFromCallback(
        `${callback}?error=access_denied&error_description=PRIVATE`,
        callback,
      ),
    /cancelado/,
  );
  assert.throws(
    () =>
      authCodeFromCallback(
        `${callback}#error=server_error&error_description=PRIVATE`,
        callback,
      ),
    (error: Error) => !error.message.includes("PRIVATE"),
  );
});

test("PKCE: un solo canje concurrente, recuperación persistida y cierre local usando el SDK", async () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  let tokenRequests = 0;
  let verifier: string | undefined;
  const user = {
    id: "00000000-0000-4000-8000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-01-01T00:00:00Z",
  };
  const jwt = [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url"),
    Buffer.from("signature").toString("base64url"),
  ].join(".");
  const options = {
    auth: {
      storage,
      storageKey: "test-auth",
      flowType: "pkce" as const,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
    },
    global: {
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("/token")) {
          tokenRequests++;
          const body = JSON.parse(String(init?.body));
          assert.equal(body.auth_code, "one-time-code");
          assert.equal(body.code_verifier, verifier);
          return new Response(
            JSON.stringify({
              access_token: jwt,
              refresh_token: "test-refresh",
              token_type: "bearer",
              expires_in: 3600,
              user,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        assert.match(String(input), /\/logout\?scope=local$/);
        return new Response(null, { status: 204 });
      },
    },
  };
  const client = createClient(
    "https://project.supabase.co",
    "sb_publishable_example",
    options,
  );
  const start = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback, skipBrowserRedirect: true },
  });
  assert.equal(start.error, null);
  const authorize = new URL(start.data.url!);
  assert.equal(authorize.searchParams.get("redirect_to"), callback);
  assert.equal(authorize.searchParams.get("code_challenge_method"), "s256");
  assert.ok(authorize.searchParams.get("code_challenge"));
  verifier = JSON.parse(values.get("test-auth-code-verifier")!).split("/")[0];
  assert.ok(verifier);
  // Otro acceso (otra pestaña) cambia el verificador más reciente.
  await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback, skipBrowserRedirect: true },
  });
  const returnUrl = `${callback}?code=one-time-code&sb_flow_id=${start.data.flowId}`;
  const first = exchangeAuthCallback(client, returnUrl, callback);
  const second = exchangeAuthCallback(client, returnUrl, callback);
  assert.equal(first, second);
  await Promise.all([first, second]);
  await exchangeAuthCallback(client, returnUrl, callback);
  assert.equal(tokenRequests, 1);
  assert.equal((await client.auth.getSession()).data.session?.user.id, user.id);
  const restored = createClient(
    "https://project.supabase.co",
    "sb_publishable_example",
    options,
  );
  assert.equal(
    (await restored.auth.getSession()).data.session?.user.id,
    user.id,
  );
  assert.equal((await restored.auth.signOut({ scope: "local" })).error, null);
  assert.equal((await restored.auth.getSession()).data.session, null);
  assert.equal(values.has("test-auth"), false);
});

test("un canje fallido no inventa una sesión ni muestra la respuesta del servidor", async () => {
  const values = new Map<string, string>();
  let tokenRequests = 0;
  const client = createClient(
    "https://project.supabase.co",
    "sb_publishable_example",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        flowType: "pkce",
        storage: {
          getItem: (key: string) => values.get(key) ?? null,
          setItem: (key: string, value: string) => {
            values.set(key, value);
          },
          removeItem: (key: string) => {
            values.delete(key);
          },
        },
      },
      global: {
        fetch: async () => {
          tokenRequests++;
          return new Response(
            JSON.stringify({
              error: "invalid_grant",
              error_description: "PRIVATE",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        },
      },
    },
  );
  await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback, skipBrowserRedirect: true },
  });
  await assert.rejects(
    exchangeAuthCallback(client, `${callback}?code=expired`, callback),
    (error: Error) => !error.message.includes("PRIVATE"),
  );
  assert.equal(tokenRequests, 1);
  assert.equal((await client.auth.getSession()).data.session, null);
});
