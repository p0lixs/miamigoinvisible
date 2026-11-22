import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createDraftRepository } from "../src/data/draft-repository.ts";
import { loadOwnResult } from "../src/data/result-repository.ts";
import { readOwnResult } from "../src/domain/result.ts";
import type { Draw } from "../src/domain/draw.ts";

test("confirmacion perdida: el reintento conserva la peticion y recupera los metadatos actuales, sin asignaciones", async () => {
  const id = randomUUID(),
    ownerId = randomUUID();
  const source: Draw = {
    id,
    version: 1,
    title: "Vista antigua",
    description: "",
    date: "",
    budgetCents: 2500,
    status: "draft",
    color: "blue",
    participants: [],
    exclusions: [],
    wishlists: {},
  };
  const commands: Record<string, unknown>[] = [];
  let reads = 0;
  const client = createClient(
    "https://project.supabase.co",
    "sb_publishable_example",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: async (input, init) => {
          const url = new URL(String(input));
          if (url.pathname.endsWith("/generate_draw")) {
            commands.push(JSON.parse(String(init?.body)));
            return new Response(
              JSON.stringify({
                id,
                status: "drawn",
                version: 4,
                drawn_at: "2026-11-22T10:00:00Z",
              }),
            );
          }
          assert.equal(url.pathname, "/rest/v1/draws");
          assert.equal(url.searchParams.get("owner_id"), `eq.${ownerId}`);
          assert.equal(
            url.searchParams.get("select")?.includes("assignments"),
            false,
          );
          if (++reads === 1)
            return new Response(
              JSON.stringify({ message: "PRIVATE", code: "PGRST204" }),
              {
                status: 400,
              },
            );
          return new Response(
            JSON.stringify([
              {
                id,
                title: "Configuración actual",
                description: "",
                budget_cents: 3000,
                exchange_date: null,
                currency: "EUR",
                color: "mint",
                version: 4,
                status: "drawn",
                drawn_at: "2026-11-22T10:00:00Z",
                draw_participants: [],
                draw_exclusions: [],
              },
            ]),
          );
        },
      },
    },
  );
  const repository = createDraftRepository(
    client,
    { id: ownerId, email: "owner@grupo.example" },
    randomUUID,
  );
  await assert.rejects(repository.generate(source));
  const generated = await repository.generate(source);
  assert.equal(commands[0].p_request_id, commands[1].p_request_id);
  assert.equal(commands[0].p_owner_id, ownerId);
  assert.deepEqual(Object.keys(commands[0]).sort(), [
    "p_draw_id",
    "p_expected_version",
    "p_owner_id",
    "p_request_id",
  ]);
  assert.equal(generated.title, "Configuración actual");
  assert.equal(generated.version, 4);
  assert.equal(generated.status, "drawn");
  assert.equal(generated.demoRecipientId, undefined);
  assert.deepEqual(generated.wishlists, {});
});

test("consulta propia: no envia correo ni persona elegida y solo conserva los campos de presentacion", async () => {
  const id = randomUUID(),
    accountId = randomUUID();
  const display = {
    available: true,
    title: "Grupo",
    description: "",
    budgetCents: 2500,
    currency: "EUR",
    date: "",
    recipientName: "Persona de prueba",
  };
  const client = createClient(
    "https://project.supabase.co",
    "sb_publishable_example",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: async (input, init) => {
          assert.match(String(input), /\/rpc\/get_my_draw_result$/);
          assert.deepEqual(JSON.parse(String(init?.body)), {
            p_draw_id: id,
            p_account_id: accountId,
          });
          return new Response(
            JSON.stringify({
              ...display,
              assignments: ["private"],
              email: "private@grupo.example",
              recipientId: "private",
            }),
          );
        },
      },
    },
  );
  assert.deepEqual(await loadOwnResult(client, id, accountId), display);
  assert.deepEqual(
    readOwnResult({ available: false, assignments: ["private"] }),
    { available: false },
  );
  assert.throws(() => readOwnResult({ ...display, recipientName: "" }));
  assert.throws(() => readOwnResult({ ...display, budgetCents: -1 }));
});

test("acceso denegado o respuesta incorrecta no revelan errores privados ni inventan un resultado", async () => {
  for (const status of [403, 500]) {
    const client = createClient(
      "https://project.supabase.co",
      "sb_publishable_example",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          fetch: async () =>
            new Response(
              JSON.stringify({
                code: status === 403 ? "42501" : "unknown",
                message: "PRIVATE",
              }),
              { status },
            ),
        },
      },
    );
    await assert.rejects(
      loadOwnResult(client, randomUUID(), randomUUID()),
      (error: Error) => !error.message.includes("PRIVATE"),
    );
  }
});
