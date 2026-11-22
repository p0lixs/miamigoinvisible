import { validDate, validEmail, type Draw } from "./draw.ts";

export class DraftError extends Error {}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function draftPayload(draw: Draw) {
  if (
    !uuid.test(draw.id) ||
    draw.status !== "draft" ||
    draw.title.length > 100 ||
    draw.description.length > 1000 ||
    !validDate(draw.date) ||
    !["blue", "coral", "mint"].includes(draw.color) ||
    (draw.budgetCents !== null &&
      (!Number.isSafeInteger(draw.budgetCents) ||
        draw.budgetCents < 1 ||
        draw.budgetCents > 99999999)) ||
    draw.participants.length > 100 ||
    draw.exclusions.length > 9900
  ) {
    throw new DraftError(
      "Revisa el título, el presupuesto y la fecha del borrador.",
    );
  }
  const ids = new Set<string>();
  const emails = new Set<string>();
  const participants = draw.participants.map((person) => {
    const name = person.name.trim();
    const email = person.email.trim();
    if (
      !uuid.test(person.id) ||
      ids.has(person.id) ||
      !name ||
      name.length > 80 ||
      !validEmail(email) ||
      email.length > 254 ||
      emails.has(email.toLowerCase())
    ) {
      throw new DraftError(
        "Revisa los participantes: necesitan nombres y correos válidos, sin duplicados.",
      );
    }
    ids.add(person.id);
    emails.add(email.toLowerCase());
    return { id: person.id, name, email };
  });
  const rules = new Set<string>();
  const exclusions = draw.exclusions.map(({ giverId, recipientId }) => {
    const key = `${giverId}:${recipientId}`;
    if (
      !ids.has(giverId) ||
      !ids.has(recipientId) ||
      giverId === recipientId ||
      rules.has(key)
    ) {
      throw new DraftError(
        "Revisa las excepciones: deben referirse a dos personas diferentes del grupo y no repetirse.",
      );
    }
    rules.add(key);
    return { giverId, recipientId };
  });
  // Lista explícita: nunca enviar deseos, resultados ni identidad del participante.
  return {
    title: draw.title.trim(),
    description: draw.description.trim(),
    budgetCents: draw.budgetCents,
    date: draw.date,
    color: draw.color,
    participants,
    exclusions,
  };
}

export function cloudDraft(
  payload: ReturnType<typeof draftPayload>,
  id: string,
  version: number,
  email: string,
): Draw {
  return {
    ...payload,
    id,
    version,
    status: "draft",
    wishlists: {},
    // Etiqueta del formulario, sin conceder acceso a deseos ni resultados.
    currentParticipantId: payload.participants.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
    )?.id,
  };
}

export function readDraftRow(value: unknown, email: string): Draw {
  const fail = () => {
    throw new DraftError(
      "No se han podido cargar tus borradores. Inténtalo de nuevo.",
    );
  };
  if (!value || typeof value !== "object") return fail();
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.description !== "string" ||
    (row.budget_cents !== null && typeof row.budget_cents !== "number") ||
    (row.exchange_date !== null && typeof row.exchange_date !== "string") ||
    (row.status !== "draft" && row.status !== "drawn") ||
    (row.status === "drawn" &&
      (typeof row.drawn_at !== "string" ||
        Number.isNaN(Date.parse(row.drawn_at)))) ||
    (row.status === "draft" && row.drawn_at != null) ||
    row.currency !== "EUR" ||
    typeof row.version !== "number" ||
    !Number.isSafeInteger(row.version) ||
    row.version < 1 ||
    !["blue", "coral", "mint"].includes(String(row.color)) ||
    !Array.isArray(row.draw_participants) ||
    !Array.isArray(row.draw_exclusions)
  )
    return fail();
  try {
    const participants = [...row.draw_participants]
      .sort((a, b) => a.position - b.position)
      .map((p) => ({ id: p.id, name: p.name, email: p.email }));
    const exclusions = row.draw_exclusions.map((r) => ({
      giverId: r.giver_id,
      recipientId: r.recipient_id,
    }));
    const payload = draftPayload({
      id: row.id,
      title: row.title,
      description: row.description,
      budgetCents: row.budget_cents,
      date: row.exchange_date ?? "",
      color: row.color as Draw["color"],
      status: "draft",
      participants,
      exclusions,
      wishlists: {},
    });
    return {
      ...cloudDraft(payload, row.id, row.version, email),
      status: row.status,
      ...(row.status === "drawn" ? { drawnAt: row.drawn_at as string } : {}),
    };
  } catch {
    return fail();
  }
}
