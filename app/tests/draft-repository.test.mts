import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createDraftRepository } from "../src/data/draft-repository.ts";
import { draftPayload, readDraftRow } from "../src/domain/draft.ts";
import { duplicateDraw, type Draw } from "../src/domain/draw.ts";

function fixture(): Draw {
  const id = randomUUID();
  return {
    id: randomUUID(),
    title: "Grupo",
    description: "",
    budgetCents: null,
    date: "",
    color: "blue",
    status: "draft",
    participants: [{ id, name: "Yo", email: "owner@example.com" }],
    exclusions: [],
    currentParticipantId: id,
    demoRecipientId: randomUUID(),
    wishlists: {
      [id]: [{ id: randomUUID(), title: "Privado", note: "", link: "" }],
    },
  };
}
test("transporte: el borrador no envía deseos ni resultados y reutiliza la petición tras perder una respuesta", async () => {
  const draw = fixture();
  const owner = { id: randomUUID(), email: "owner@example.com" };
  const bodies: Record<string, unknown>[] = [];
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
        fetch: async (url, init) => {
          assert.match(String(url), /\/rest\/v1\/rpc\/save_draw_draft$/);
          bodies.push(JSON.parse(String(init?.body)));
          if (bodies.length === 1)
            return new Response(
              JSON.stringify({ message: "PRIVATE", code: "unknown" }),
              { status: 503 },
            );
          return new Response(JSON.stringify({ id: draw.id, version: 1 }), {
            status: 200,
          });
        },
      },
    },
  );
  const repository = createDraftRepository(client, owner, randomUUID);
  await assert.rejects(
    repository.save(draw),
    (error: Error) => !error.message.includes("PRIVATE"),
  );
  const saved = await repository.save(draw);
  assert.equal(saved.version, 1);
  assert.equal(saved.demoRecipientId, undefined);
  assert.deepEqual(saved.wishlists, {});
  assert.equal(saved.currentParticipantId, draw.participants[0].id);
  assert.equal(bodies[0].p_request_id, bodies[1].p_request_id);
  assert.equal(bodies[1].p_owner_id, owner.id);
  assert.equal(bodies[1].p_expected_version, 0);
  const serialized = JSON.stringify(bodies[1].p_draft);
  for (const field of [
    "wishlists",
    "demoRecipientId",
    "currentParticipantId",
    "status",
    "Privado",
  ])
    assert.equal(serialized.includes(field), false);
});

test("lectura: consulta limitada al propietario, sin comodines, orden estable y sin datos de la demo", async () => {
  const draw = fixture();
  const owner = { id: randomUUID(), email: "owner@example.com" };
  const row = {
    id: draw.id,
    title: draw.title,
    description: "",
    budget_cents: 2000,
    currency: "EUR",
    exchange_date: null,
    status: "draft",
    color: "coral",
    version: 3,
    draw_participants: draw.participants.map((p) => ({ ...p, position: 0 })),
    draw_exclusions: [],
    wishlists: { hidden: "ignored" },
    demoRecipientId: "ignored",
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
        fetch: async (input) => {
          const url = new URL(String(input));
          assert.equal(url.searchParams.get("owner_id"), `eq.${owner.id}`);
          assert.equal(url.searchParams.get("order"), "updated_at.desc");
          assert.equal(url.searchParams.get("select")?.includes("*"), false);
          const select = url.searchParams.get("select") ?? "";
          // El esquema real tambien tiene rutas indirectas mediante excepciones.
          // PostgREST rechaza el embedding si no se elige cada FK directa.
          if (
            !select.includes(
              "draw_participants!draw_participants_draw_id_fkey(",
            ) ||
            !select.includes("draw_exclusions!draw_exclusions_draw_id_fkey(")
          ) {
            return new Response(
              JSON.stringify({
                code: "PGRST201",
                message: "Ambiguous embedding",
              }),
              { status: 300 },
            );
          }
          return new Response(JSON.stringify([row]), { status: 200 });
        },
      },
    },
  );
  const result = await createDraftRepository(client, owner, randomUUID).list();
  assert.equal(result[0].id, draw.id);
  assert.equal(result[0].version, 3);
  assert.deepEqual(result[0].wishlists, {});
  assert.equal(result[0].demoRecipientId, undefined);
  assert.throws(() => readDraftRow({ ...row, status: "drawn" }, owner.email));
});

test("copiar un borrador crea identidades nuevas, versión inicial y ninguna credencial o lista", () => {
  const source = { ...fixture(), version: 9 };
  const copy = duplicateDraw(source, randomUUID);
  assert.notEqual(copy.id, source.id);
  assert.notEqual(copy.participants[0].id, source.participants[0].id);
  assert.equal(copy.version, undefined);
  assert.deepEqual(copy.wishlists, {});
  assert.equal(copy.demoRecipientId, undefined);
  assert.doesNotThrow(() => draftPayload(copy));
  const longCopy = duplicateDraw(
    { ...source, title: "🎁".repeat(50) },
    randomUUID,
  );
  assert.ok(longCopy.title.length <= 100);
  assert.ok(longCopy.title.endsWith(" · copia"));
  assert.doesNotThrow(() => draftPayload(longCopy));
});

test("conflictos y permisos fallidos no producen un guardado ficticio", async () => {
  for (const code of ["40001", "42501", "PGRST202"]) {
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
            new Response(JSON.stringify({ code, message: "PRIVATE" }), {
              status: 409,
            }),
        },
      },
    );
    await assert.rejects(
      createDraftRepository(
        client,
        { id: randomUUID(), email: "owner@example.com" },
        randomUUID,
      ).save(fixture()),
      (error: Error) => !error.message.includes("PRIVATE"),
    );
  }
});
