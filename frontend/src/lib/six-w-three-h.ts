import type { SixWThreeH } from "./types";

// The intake AI agent returns "Not specified - needs founder input" for fields
// it genuinely can't infer. In the UI we don't want that raw string littering
// the dashboard — we surface those gaps as a muted "needs founder input" state
// instead, so the structure reads cleanly.

const NOT_SPECIFIED = /not specified|needs founder input/i;

export type CleanedField = {
  key: string;
  value: string;
  inferred: boolean;
};

export const cleanSixWThreeH = (
  summary: string | null,
): { fields: CleanedField[]; gaps: number } => {
  if (!summary) return { fields: [], gaps: 0 };
  let parsed: Record<string, string> | null = null;
  try {
    parsed = JSON.parse(summary);
  } catch {
    return { fields: [], gaps: 0 };
  }
  if (!parsed || typeof parsed !== "object") return { fields: [], gaps: 0 };

  const fields: CleanedField[] = [];
  let gaps = 0;
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== "string") continue;
    if (NOT_SPECIFIED.test(value) || !value.trim()) {
      fields.push({ key, value: "", inferred: false });
      gaps += 1;
    } else {
      fields.push({ key, value: value.trim(), inferred: true });
    }
  }
  return { fields, gaps };
};

export const hasSixWThreeH = (summary: string | null): boolean =>
  cleanSixWThreeH(summary).fields.some((f) => f.value);
