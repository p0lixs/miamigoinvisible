export type Participant = { id: string; name: string; email: string };
export type Exclusion = { giverId: string; recipientId: string };
export type Wish = { id: string; title: string; note: string; link: string };
export type Draw = {
  id: string;
  title: string;
  description: string;
  budgetCents: number | null;
  date: string;
  status: "draft" | "drawn";
  participants: Participant[];
  exclusions: Exclusion[];
  currentParticipantId?: string;
  // Solo el destinatario propio de la escena de ejemplo; nunca un mapa de asignaciones.
  demoRecipientId?: string;
  wishlists: Record<string, Wish[]>;
  color: "blue" | "coral" | "mint";
};

export function parseBudget(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(normalized)) return null;
  const [euros, cents = ""] = normalized.split(".");
  const result = Number(euros) * 100 + Number(cents.padEnd(2, "0"));
  return result > 0 ? result : null;
}

export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function safeWebLink(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function validDate(value: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

export function validateDraw(draw: Draw): string[] {
  const errors: string[] = [];
  if (!draw.title.trim()) errors.push("Añade un título al sorteo.");
  if (!Number.isSafeInteger(draw.budgetCents) || (draw.budgetCents ?? 0) <= 0)
    errors.push("Indica un presupuesto orientativo mayor que cero.");
  if (!validDate(draw.date))
    errors.push("Revisa la fecha: usa el formato AAAA-MM-DD.");
  if (draw.participants.length < 3)
    errors.push("Añade al menos 3 participantes.");
  if (draw.participants.length > 100)
    errors.push("Esta primera versión admite hasta 100 participantes.");
  const emails = new Set<string>();
  const ids = new Set<string>();
  for (const person of draw.participants) {
    if (!person.name.trim() || !validEmail(person.email))
      errors.push("Cada participante necesita nombre y un correo válido.");
    const email = person.email.trim().toLowerCase();
    if (emails.has(email))
      errors.push("Cada participante debe tener un correo diferente.");
    if (ids.has(person.id))
      errors.push("Los identificadores de participantes deben ser únicos.");
    emails.add(email);
    ids.add(person.id);
  }
  if (
    draw.exclusions.some(
      (rule) =>
        rule.giverId === rule.recipientId ||
        !ids.has(rule.giverId) ||
        !ids.has(rule.recipientId),
    )
  )
    errors.push(
      "Revisa las excepciones: deben referirse a dos personas diferentes del grupo.",
    );
  return [...new Set(errors)];
}

export function duplicateDraw(source: Draw, id: () => string): Draw {
  const participantIds = new Map(
    source.participants.map((person) => [person.id, id()]),
  );
  return {
    id: id(),
    title: `${source.title} · copia`,
    description: source.description,
    budgetCents: source.budgetCents,
    date: source.date,
    status: "draft",
    color: source.color,
    participants: source.participants.map((person) => ({
      ...person,
      id: participantIds.get(person.id)!,
    })),
    exclusions: source.exclusions.map((rule) => ({
      giverId: participantIds.get(rule.giverId)!,
      recipientId: participantIds.get(rule.recipientId)!,
    })),
    currentParticipantId: source.currentParticipantId
      ? participantIds.get(source.currentParticipantId)
      : undefined,
    wishlists: {},
  };
}

export function money(cents: number | null): string {
  return cents === null
    ? "Sin presupuesto"
    : new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: cents % 100 ? 2 : 0,
      }).format(cents / 100);
}

export function dateLabel(value: string): string {
  return value && validDate(value)
    ? new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }).format(new Date(`${value}T12:00:00Z`))
    : "Fecha por decidir";
}
