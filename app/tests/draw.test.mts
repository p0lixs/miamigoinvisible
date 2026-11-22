import { test } from "node:test";
import assert from "node:assert/strict";
import {
  duplicateDraw,
  parseBudget,
  safeWebLink,
  validDate,
  validateDraw,
} from "../src/domain/draw.ts";

test("presupuesto obligatorio: céntimos exactos y formatos ambiguos rechazados", () => {
  assert.equal(parseBudget("25,50"), 2550);
  assert.equal(parseBudget("0.01"), 1);
  for (const input of [
    "",
    "0",
    "-1",
    "1e3",
    "1.234,50",
    "25.555",
    "NaN",
    "Infinity",
  ])
    assert.equal(parseBudget(input), null, input);
});

test("la copia es independiente y no hereda deseos ni destinatarios", () => {
  let next = 0;
  const original = {
    id: "original",
    title: "Amigos",
    description: "Una sorpresa",
    budgetCents: 2000,
    date: "2026-12-20",
    status: "drawn" as const,
    color: "blue" as const,
    currentParticipantId: "a",
    demoRecipientId: "b",
    participants: [
      { id: "a", name: "Ana", email: "a@example.com" },
      { id: "b", name: "Luis", email: "b@example.com" },
    ],
    exclusions: [{ giverId: "a", recipientId: "b" }],
    wishlists: { a: [{ id: "secret", title: "Libro", note: "", link: "" }] },
  };
  const before = JSON.stringify(original);
  const copied = duplicateDraw(original, () => `new-${++next}`);
  assert.notEqual(copied.id, original.id);
  assert.equal(copied.status, "draft");
  assert.equal(copied.demoRecipientId, undefined);
  assert.deepEqual(copied.wishlists, {});
  assert.deepEqual(copied.exclusions, [
    {
      giverId: copied.participants[0].id,
      recipientId: copied.participants[1].id,
    },
  ]);
  assert.equal(copied.currentParticipantId, copied.participants[0].id);
  copied.participants[0].name = "Otro nombre";
  assert.equal(JSON.stringify(original), before);
});

test("los deseos solo permiten enlaces web y fechas de calendario reales", () => {
  assert.equal(safeWebLink("javascript:alert(1)"), false);
  assert.equal(safeWebLink("https://user:pass@example.com"), false);
  assert.equal(safeWebLink("https://example.com/regalo"), true);
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2028-02-29"), true);
});

test("validación previa al sorteo detecta correo duplicado y presupuesto ausente", () => {
  const errors = validateDraw({
    id: "draft",
    title: "Amigos",
    description: "",
    budgetCents: null,
    date: "",
    status: "draft",
    color: "blue",
    wishlists: {},
    exclusions: [],
    participants: [
      { id: "1", name: "Ana", email: "ana@example.com" },
      { id: "2", name: "Otra", email: "ANA@example.com" },
      { id: "3", name: "Luis", email: "luis@example.com" },
    ],
  });
  assert.ok(errors.some((value) => value.includes("presupuesto")));
  assert.ok(errors.some((value) => value.includes("correo diferente")));
});
