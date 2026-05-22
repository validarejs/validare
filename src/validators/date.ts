import type { ValidatorFactory } from "../core/types";

const FORMAT_TOKENS = /YYYY|MM|DD/g;

/** Parse a date string given a format like 'MM/DD/YYYY' or 'YYYY-MM-DD' */
function parseDate(value: string, format: string): Date | null {
  // Extract separator from format (first non-token character)
  const sep = format.replace(FORMAT_TOKENS, "").charAt(0);
  if (!sep) return null;

  const formatParts = format.split(sep);
  const valueParts = value.split(sep);
  if (formatParts.length !== valueParts.length) return null;

  let year = 0;
  let month = 0;
  let day = 0;
  for (let i = 0; i < formatParts.length; i++) {
    const n = Number.parseInt(valueParts[i], 10);
    if (Number.isNaN(n)) return null;
    if (formatParts[i] === "YYYY") year = n;
    else if (formatParts[i] === "MM") month = n;
    else if (formatParts[i] === "DD") day = n;
  }

  // month is 1-based here, Date uses 0-based
  const d = new Date(year, month - 1, day);
  // Verify the date didn't roll over (e.g. Feb 30 → Mar 1)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  return d;
}

export const date: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { format?: string };
    const format = opts.format ?? "MM/DD/YYYY";
    if (!input.value) return { valid: false };
    return { valid: parseDate(input.value, format) !== null };
  },
});
