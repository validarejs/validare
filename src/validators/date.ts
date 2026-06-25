import type { ValidatorFactory } from "../core/types";

// Tokens ordered longest-first to avoid partial matches in alternation
const TOKEN_RE = /YYYY|HH|hh|MM|DD|mm|ss|A/g;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMatcher(format: string): { re: RegExp; tokens: string[] } | null {
  const tokens: string[] = [];
  let reStr = "";
  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(format)) !== null) {
    reStr += escapeRe(format.slice(lastIndex, match.index));
    tokens.push(match[0]);
    if (match[0] === "YYYY") reStr += "(\\d{4})";
    else if (match[0] === "A") reStr += "(AM|PM|am|pm)";
    else reStr += "(\\d{1,2})";
    lastIndex = TOKEN_RE.lastIndex;
  }
  reStr += escapeRe(format.slice(lastIndex));
  if (tokens.length === 0) return null;
  return { re: new RegExp(`^${reStr}$`), tokens };
}

export const date: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { format?: string };
    const format = opts.format ?? "MM/DD/YYYY";
    if (!input.value) return { valid: false };

    const matcher = buildMatcher(format);
    if (!matcher) return { valid: false };

    const m = matcher.re.exec(input.value);
    if (!m) return { valid: false };

    let year = 1970, month = 1, day = 1, hours = 0, minutes = 0, seconds = 0, ampm = "";

    for (let i = 0; i < matcher.tokens.length; i++) {
      const val = m[i + 1];
      switch (matcher.tokens[i]) {
        case "YYYY": year    = Number.parseInt(val, 10); break;
        case "MM":   month   = Number.parseInt(val, 10); break;
        case "DD":   day     = Number.parseInt(val, 10); break;
        case "HH":   hours   = Number.parseInt(val, 10); break;
        case "hh":   hours   = Number.parseInt(val, 10); break;
        case "mm":   minutes = Number.parseInt(val, 10); break;
        case "ss":   seconds = Number.parseInt(val, 10); break;
        case "A":    ampm    = val.toUpperCase(); break;
      }
    }

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    if (month < 1 || month > 12) return { valid: false };
    if (day < 1 || day > 31) return { valid: false };
    if (hours < 0 || hours > 23) return { valid: false };
    if (minutes < 0 || minutes > 59) return { valid: false };
    if (seconds < 0 || seconds > 59) return { valid: false };

    // Verify the date didn't roll over (e.g. Feb 30 → Mar 1)
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
      return { valid: false };
    }

    return { valid: true };
  },
});
