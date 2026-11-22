import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomInt } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("sorteo en PostgreSQL: restricciones, privacidad, bloqueo e idempotencia", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  const owner = randomUUID(),
    member = randomUUID(),
    outsider = randomUUID(),
    unverified = randomUUID();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
  `);
  for (const [id, email, confirmed] of [
    [owner, "a@grupo.example", true],
    [member, "b@grupo.example", true],
    [outsider, "other@grupo.example", true],
    [unverified, "a@grupo.example", false],
  ] as const) {
    await db.query("insert into auth.users values ($1,$2,$3)", [
      id,
      email,
      confirmed ? new Date().toISOString() : null,
    ]);
  }
  for (const filename of [
    "202611220001_drafts.sql",
    "202611220002_draw_runs.sql",
  ]) {
    await db.exec(
      await readFile(
        new URL(`../../supabase/migrations/${filename}`, import.meta.url),
        "utf8",
      ),
    );
  }
  const as = <T,>(
    actor: string | null,
    action: (
      tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    ) => Promise<T>,
  ) =>
    db.transaction(async (tx) => {
      await tx.exec(
        actor ? "set local role authenticated" : "set local role anon",
      );
      await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [
        actor ?? "",
      ]);
      return action(tx);
    });
  type Payload = {
    title: string;
    description: string;
    budgetCents: number | null;
    date: string;
    color: string;
    participants: { id: string; name: string; email: string }[];
    exclusions: { giverId: string; recipientId: string }[];
  };
  const make = (n = 3): Payload => ({
    title: "Sorpresa de prueba",
    description: "",
    budgetCents: 2500,
    date: "",
    color: "blue",
    participants: Array.from({ length: n }, (_, i) => ({
      id: randomUUID(),
      name: `Persona ${i}`,
      email: ["a@grupo.example", "b@grupo.example"][i] ?? `p${i}@grupo.example`,
    })),
    exclusions: [],
  });
  const create = async (payload: Payload) => {
    const id = randomUUID(),
      request = randomUUID();
    await as(owner, (tx) =>
      tx.query("select public.save_draw_draft($1,$2,0,$3,$4::jsonb)", [
        id,
        owner,
        request,
        JSON.stringify(payload),
      ]),
    );
    return { id, request };
  };
  const run = async (
    id: string,
    actor: string | null = owner,
    version = 1,
    expectedOwner = actor,
  ) =>
    as(actor, async (tx) => {
      const response = await tx.query<{
        result: {
          id: string;
          status: string;
          version: number;
          drawn_at: string;
        };
      }>("select public.generate_draw($1,$2,$3,$4) as result", [
        id,
        expectedOwner,
        version,
        randomUUID(),
      ]);
      return response.rows[0].result;
    });
  const result = async (id: string, actor: string, account = actor) =>
    as(actor, async (tx) => {
      const response = await tx.query<{ result: Record<string, unknown> }>(
        "select public.get_my_draw_result($1,$2) as result",
        [id, account],
      );
      return response.rows[0].result;
    });
  const code = (expected: string) => (error: unknown) =>
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === expected;
  const assignments = async (id: string) =>
    (
      await db.query<{ giver_id: string; recipient_id: string }>(
        "select giver_id,recipient_id from draw_private.assignments where draw_id=$1 order by giver_id",
        [id],
      )
    ).rows;
  const valid = async (id: string, payload: Payload) => {
    const rows = await assignments(id);
    assert.equal(rows.length, payload.participants.length);
    assert.equal(new Set(rows.map((r) => r.giver_id)).size, rows.length);
    assert.equal(new Set(rows.map((r) => r.recipient_id)).size, rows.length);
    const people = new Set(payload.participants.map((p) => p.id));
    for (const row of rows) {
      assert.ok(people.has(row.giver_id) && people.has(row.recipient_id));
      assert.notEqual(row.giver_id, row.recipient_id);
      assert.equal(
        payload.exclusions.some(
          (e) =>
            e.giverId === row.giver_id && e.recipientId === row.recipient_id,
        ),
        false,
      );
    }
    return rows;
  };
  const payload = make();
  payload.exclusions.push({
    giverId: payload.participants[0].id,
    recipientId: payload.participants[1].id,
  });
  const draw = await create(payload);

  await t.test(
    "solo el propietario genera, con version vigente y entrada completa",
    async () => {
      await assert.rejects(run(draw.id, null), code("42501"));
      await assert.rejects(run(draw.id, member), code("42501"));
      await assert.rejects(run(draw.id, member, 1, owner), code("42501"));
      await assert.rejects(run(draw.id, owner, 2), code("40001"));
      for (const incomplete of [
        { ...make(), budgetCents: null },
        { ...make(), title: "" },
        make(2),
      ]) {
        const d = await create(incomplete);
        await assert.rejects(run(d.id), code("22023"));
        assert.equal((await assignments(d.id)).length, 0);
      }
      assert.equal((await result(draw.id, owner)).available, false);
    },
  );
  await t.test(
    "una sola ejecucion y ningun mapa de resultados en la respuesta",
    async () => {
      const summary = await run(draw.id);
      assert.deepEqual(Object.keys(summary).sort(), [
        "drawn_at",
        "id",
        "status",
        "version",
      ]);
      assert.equal(summary.status, "drawn");
      assert.equal(summary.version, 2);
      const original = await valid(draw.id, payload);
      assert.deepEqual(await run(draw.id), summary);
      assert.deepEqual(await assignments(draw.id), original);
      assert.equal(
        (
          await db.query<{ n: number }>(
            "select count(*)::int as n from draw_private.runs where draw_id=$1",
            [draw.id],
          )
        ).rows[0].n,
        1,
      );
    },
  );
  await t.test(
    "cada correo verificado ve solo su destinatario; el organizador no tiene acceso extra",
    async () => {
      for (const actor of [owner, member]) {
        const own = await result(draw.id, actor);
        const giver = payload.participants.find(
          (p) =>
            p.email ===
            (actor === owner ? "a@grupo.example" : "b@grupo.example"),
        )!;
        const assigned = (await assignments(draw.id)).find(
          (a) => a.giver_id === giver.id,
        )!;
        assert.equal(
          own.recipientName,
          payload.participants.find((p) => p.id === assigned.recipient_id)
            ?.name,
        );
        assert.deepEqual(Object.keys(own).sort(), [
          "available",
          "budgetCents",
          "currency",
          "date",
          "description",
          "recipientName",
          "title",
        ]);
        for (const sql of [
          "select * from draw_private.assignments",
          "select * from draw_private.runs",
          "select draw_private.save_draw_draft(null,null,0,null,null)",
        ]) {
          await assert.rejects(
            as(actor, (tx) => tx.exec(sql)),
            code("42501"),
          );
        }
      }
      assert.deepEqual(await result(draw.id, outsider), { available: false });
      assert.deepEqual(await result(randomUUID(), outsider), {
        available: false,
      });
      await assert.rejects(result(draw.id, unverified), code("42501"));
      await assert.rejects(result(draw.id, owner, member), code("42501"));
      const withoutOwner = make();
      withoutOwner.participants[0].email = "different@grupo.example";
      const other = await create(withoutOwner);
      await run(other.id);
      assert.deepEqual(await result(other.id, owner), { available: false });
      assert.equal(
        (
          await as(member, (tx) =>
            tx.query("select id from public.draws where id=$1", [draw.id]),
          )
        ).rows.length,
        0,
      );
    },
  );
  await t.test(
    "sorteado significa configuracion bloqueada, incluso al repetir el ultimo guardado",
    async () => {
      await assert.rejects(
        as(owner, (tx) =>
          tx.query("select public.save_draw_draft($1,$2,0,$3,$4::jsonb)", [
            draw.id,
            owner,
            draw.request,
            JSON.stringify(payload),
          ]),
        ),
        code("22023"),
      );
      await assert.rejects(
        as(owner, (tx) => tx.exec("update public.draws set status='draft'")),
        code("42501"),
      );
      const checks = await db.query<{ correcto: boolean }>(
        await readFile(
          new URL("../../supabase/checks/verify_drafts.sql", import.meta.url),
          "utf8",
        ),
      );
      assert.ok(checks.rows.every((r) => r.correcto));
      const privateChecks = await db.query<{ correcto: boolean }>(
        await readFile(
          new URL(
            "../../supabase/checks/verify_draw_runs.sql",
            import.meta.url,
          ),
          "utf8",
        ),
      );
      assert.equal(privateChecks.rows.length, 9);
      assert.ok(privateChecks.rows.every((r) => r.correcto));
    },
  );
  await t.test("permite parejas reciprocas y grupos de 100", async () => {
    const reciprocal = make(4);
    for (let g = 0; g < 4; g++)
      for (let r = 0; r < 4; r++)
        if (g !== r && r !== (g ^ 1))
          reciprocal.exclusions.push({
            giverId: reciprocal.participants[g].id,
            recipientId: reciprocal.participants[r].id,
          });
    const forced = await create(reciprocal);
    await run(forced.id);
    await valid(forced.id, reciprocal);
    const large = make(100),
      d = await create(large);
    await run(d.id);
    await valid(d.id, large);
  });
  await t.test(
    "detecta imposibilidad global aunque todas las personas tengan alguna opcion",
    async () => {
      const impossible = make(4);
      for (let g = 0; g < 3; g++)
        for (let r = 0; r < 3; r++)
          if (g !== r)
            impossible.exclusions.push({
              giverId: impossible.participants[g].id,
              recipientId: impossible.participants[r].id,
            });
      const d = await create(impossible);
      await assert.rejects(
        run(d.id),
        (error: unknown) =>
          code("22023")(error) &&
          error instanceof Error &&
          error.message === "DRAW_IMPOSSIBLE",
      );
      assert.deepEqual(
        (
          await db.query(
            "select status,version,drawn_at from public.draws where id=$1",
            [d.id],
          )
        ).rows[0],
        { status: "draft", version: 1, drawn_at: null },
      );
      assert.equal((await assignments(d.id)).length, 0);
      assert.equal(
        (
          await db.query<{ n: number }>(
            "select count(*)::int as n from draw_private.runs where draw_id=$1",
            [d.id],
          )
        ).rows[0].n,
        0,
      );
    },
  );
  await t.test(
    "compara grafos aleatorios pequenos con un buscador exhaustivo independiente",
    async () => {
      for (let trial = 0; trial < 24; trial++) {
        const p = make(3 + (trial % 4));
        const n = p.participants.length;
        const allowed = Array.from({ length: n }, (_, g) =>
          Array.from({ length: n }, (_, r) => g !== r && randomInt(100) < 55),
        );
        for (let g = 0; g < n; g++)
          for (let r = 0; r < n; r++)
            if (g !== r && !allowed[g][r])
              p.exclusions.push({
                giverId: p.participants[g].id,
                recipientId: p.participants[r].id,
              });
        const possible = (g = 0, used = 0): boolean =>
          g === n ||
          allowed[g].some(
            (ok, r) =>
              ok && !(used & (1 << r)) && possible(g + 1, used | (1 << r)),
          );
        const d = await create(p);
        if (possible()) {
          await run(d.id);
          await valid(d.id, p);
        } else await assert.rejects(run(d.id), code("22023"));
      }
    },
  );
});
