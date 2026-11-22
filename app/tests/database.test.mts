import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("PostgreSQL: aislamiento, atomicidad, versiones, reintentos y restricciones de borradores", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  const a = "00000000-0000-4000-8000-000000000001";
  const b = "00000000-0000-4000-8000-000000000002";
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
    insert into auth.users(id) values ('${a}'), ('${b}');
  `);
  const verificationSql = await readFile(
    new URL("../../supabase/checks/verify_drafts.sql", import.meta.url),
    "utf8",
  );
  const absentSchema = await db.query<{
    comprobacion: string;
    correcto: boolean;
  }>(verificationSql);
  assert.equal(absentSchema.rows.length, 17);
  assert.ok(absentSchema.rows.every((row) => row.correcto === false));
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/202611220001_drafts.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const checks = await db.query<{ comprobacion: string; correcto: boolean }>(
    verificationSql,
  );
  assert.ok(
    checks.rows.every((row) => row.correcto === true),
    JSON.stringify(checks.rows.filter((row) => !row.correcto)),
  );
  await db.exec("begin; alter table public.draws disable row level security;");
  const changed = await db.query<{ comprobacion: string; correcto: boolean }>(
    verificationSql,
  );
  assert.equal(
    changed.rows.find((row) => row.comprobacion === "draws: tabla con RLS")
      ?.correcto,
    false,
  );
  await db.exec("rollback;");
  const as = async <T,>(
    user: string | null,
    run: (
      tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    ) => Promise<T>,
  ) =>
    db.transaction(async (tx) => {
      await tx.exec(
        user ? "set local role authenticated" : "set local role anon",
      );
      await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [
        user ?? "",
      ]);
      return run(tx);
    });
  const id = randomUUID();
  const first = randomUUID();
  const second = randomUUID();
  const payload = {
    title: "Grupo de prueba",
    description: "",
    budgetCents: null,
    date: "",
    color: "blue",
    participants: [
      { id: first, name: "Persona A", email: "a@example.com" },
      { id: second, name: "Persona B", email: "b@example.com" },
    ],
    exclusions: [{ giverId: first, recipientId: second }],
  };
  const save = (
    actor: string | null,
    drawId: string,
    version: number,
    requestId: string,
    data: unknown,
    owner = actor,
  ) =>
    as(actor, async (tx) => {
      const result = await tx.query<{
        result: { id: string; version: number };
      }>("select public.save_draw_draft($1, $2, $3, $4, $5::jsonb) as result", [
        drawId,
        owner,
        version,
        requestId,
        JSON.stringify(data),
      ]);
      return result.rows[0].result;
    });
  const sqlCode = (code: string) => (error: unknown) =>
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === code;
  const initialRequest = randomUUID();
  assert.deepEqual(await save(a, id, 0, initialRequest, payload), {
    id,
    version: 1,
  });

  await t.test(
    "solo el propietario lee padres, participantes y excepciones",
    async () => {
      const rows = await as(a, (tx) =>
        tx.query("select id, title from public.draws"),
      );
      assert.equal(rows.rows.length, 1);
      for (const table of ["draws", "draw_participants", "draw_exclusions"]) {
        const result = await as(b, (tx) =>
          tx.query<{ n: number }>(
            `select count(*)::int as n from public.${table}`,
          ),
        );
        assert.equal(result.rows[0].n, 0, table);
      }
      await assert.rejects(
        as(a, (tx) => tx.query("select last_request_id from public.draws")),
        sqlCode("42501"),
      );
    },
  );
  await t.test(
    "anónimos, suplantación, identificadores ajenos y escrituras directas rechazados",
    async () => {
      await assert.rejects(
        save(null, id, 1, randomUUID(), payload),
        sqlCode("42501"),
      );
      await assert.rejects(
        as(null, (tx) => tx.query("select id from public.draws")),
        sqlCode("42501"),
      );
      await assert.rejects(
        save(b, id, 1, randomUUID(), payload),
        sqlCode("42501"),
      );
      await assert.rejects(
        save(b, id, 0, randomUUID(), payload),
        sqlCode("42501"),
      );
      await assert.rejects(
        save(b, randomUUID(), 1, randomUUID(), payload),
        sqlCode("42501"),
      );
      await assert.rejects(
        save(b, randomUUID(), 0, randomUUID(), payload, a),
        sqlCode("42501"),
      );
      for (const sql of [
        "insert into public.draws(id) values (gen_random_uuid())",
        "update public.draws set title='intruso'",
        "delete from public.draw_participants",
        "delete from public.draw_exclusions",
      ]) {
        await assert.rejects(
          as(a, (tx) => tx.exec(sql)),
          sqlCode("42501"),
        );
      }
    },
  );
  await t.test(
    "reintento idempotente y edición con versión anterior no sobrescriben cambios",
    async () => {
      assert.equal((await save(a, id, 0, initialRequest, payload)).version, 1);
      const request = randomUUID();
      const updated = {
        ...payload,
        title: "Título actualizado",
        budgetCents: 2500,
        date: "2026-12-20",
      };
      assert.equal((await save(a, id, 1, request, updated)).version, 2);
      assert.equal((await save(a, id, 1, request, updated)).version, 2);
      await assert.rejects(
        save(a, id, 1, randomUUID(), payload),
        sqlCode("40001"),
      );
      await assert.rejects(save(a, id, 2, request, payload), sqlCode("40001"));
      const current = await as(a, (tx) =>
        tx.query("select title, version from public.draws where id=$1", [id]),
      );
      assert.deepEqual(current.rows[0], {
        title: "Título actualizado",
        version: 2,
      });
    },
  );
  await t.test(
    "excepciones de otro grupo y autoexclusiones deshacen toda la edición",
    async () => {
      const other = randomUUID();
      const outsider = randomUUID();
      await save(a, other, 0, randomUUID(), {
        ...payload,
        participants: [
          { id: outsider, name: "Otra persona", email: "other@example.com" },
        ],
        exclusions: [],
      });
      await assert.rejects(
        save(a, id, 2, randomUUID(), {
          ...payload,
          title: "No debe guardarse",
          exclusions: [{ giverId: first, recipientId: outsider }],
        }),
        sqlCode("23503"),
      );
      await assert.rejects(
        save(a, id, 2, randomUUID(), {
          ...payload,
          exclusions: [{ giverId: first, recipientId: first }],
        }),
        sqlCode("23514"),
      );
      const rows = await as(a, (tx) =>
        tx.query<{ title: string; version: number }>(
          "select title, version from public.draws where id=$1",
          [id],
        ),
      );
      assert.equal(rows.rows[0].version, 2);
      assert.equal(rows.rows[0].title, "Título actualizado");
      const people = await as(a, (tx) =>
        tx.query<{ n: number }>(
          "select count(*)::int as n from public.draw_participants where draw_id=$1",
          [id],
        ),
      );
      assert.equal(people.rows[0].n, 2);
    },
  );
  await t.test(
    "borradores incompletos permitidos y correos duplicados, fechas y campos privados rechazados",
    async () => {
      await save(b, randomUUID(), 0, randomUUID(), {
        ...payload,
        title: "",
        participants: [],
        exclusions: [],
      });
      await assert.rejects(
        save(a, randomUUID(), 0, randomUUID(), {
          ...payload,
          participants: [
            { id: first, name: "A", email: "same@example.com" },
            { id: second, name: "B", email: "SAME@example.com" },
          ],
        }),
        sqlCode("23505"),
      );
      await assert.rejects(
        save(a, randomUUID(), 0, randomUUID(), {
          ...payload,
          date: "2026-02-30",
        }),
        sqlCode("22008"),
      );
      for (const field of [
        "wishlists",
        "demoRecipientId",
        "owner_id",
        "status",
      ]) {
        await assert.rejects(
          save(a, randomUUID(), 0, randomUUID(), {
            ...payload,
            [field]: "forbidden",
          }),
          sqlCode("22023"),
        );
      }
      const mutual = {
        ...payload,
        exclusions: [
          { giverId: first, recipientId: second },
          { giverId: second, recipientId: first },
        ],
      };
      await save(a, randomUUID(), 0, randomUUID(), mutual);
    },
  );
});
