import { validDate } from "./draw.ts";
import { DraftError } from "./draft.ts";

export type OwnResult =
  | { available: false }
  | {
      available: true;
      title: string;
      description: string;
      budgetCents: number;
      currency: "EUR";
      date: string;
      recipientName: string;
    };
export function readOwnResult(value: unknown): OwnResult {
  if (!value || typeof value !== "object")
    throw new DraftError(
      "No se ha podido abrir tu resultado. Inténtalo de nuevo.",
    );
  const data = value as Record<string, unknown>;
  if (data.available === false) return { available: false };
  if (
    data.available !== true ||
    typeof data.title !== "string" ||
    !data.title.trim() ||
    data.title.length > 100 ||
    typeof data.description !== "string" ||
    data.description.length > 1000 ||
    typeof data.recipientName !== "string" ||
    !data.recipientName.trim() ||
    data.recipientName.length > 80 ||
    typeof data.budgetCents !== "number" ||
    !Number.isSafeInteger(data.budgetCents) ||
    data.budgetCents <= 0 ||
    data.budgetCents > 99999999 ||
    data.currency !== "EUR" ||
    typeof data.date !== "string" ||
    !validDate(data.date)
  )
    throw new DraftError(
      "No se ha podido abrir tu resultado. Inténtalo de nuevo.",
    );
  // Extraer campos conocidos; nunca conservar mapas, identificadores ni correos.
  return {
    available: true,
    title: data.title,
    description: data.description,
    budgetCents: data.budgetCents,
    currency: data.currency,
    date: data.date,
    recipientName: data.recipientName,
  };
}
