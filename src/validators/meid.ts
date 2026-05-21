import type { ValidatorFactory } from "../core/types";

const LUHN_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
];

function luhn(value: string): boolean {
  let mul = 0;
  let sum = 0;
  let length = value.length;
  while (length--) {
    sum += LUHN_TABLE[mul][Number.parseInt(value.charAt(length), 10)];
    mul = 1 - mul;
  }
  return sum % 10 === 0 && sum > 0;
}

function hexCheckValid(v: string): boolean {
  // v is the full 15-char hex MEID (uppercase, separators already stripped)
  const cd = v.charAt(v.length - 1).toUpperCase();
  const body = v.slice(0, -1); // first 14 chars
  let checkDigit = "";
  for (let i = 1; i <= 13; i += 2) {
    checkDigit += (Number.parseInt(body.charAt(i), 16) * 2).toString(16);
  }
  let sum = 0;
  for (let i = 0; i < checkDigit.length; i++) {
    sum += Number.parseInt(checkDigit.charAt(i), 16);
  }
  if (sum % 10 === 0) return cd === "0";
  return cd === ((Math.ceil((sum + 1) / 10) * 10 - sum) * 2).toString(16).toUpperCase();
}

export const meid: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    const v = input.value;

    // Hex formats with check digit (15 chars)
    if (
      /^[0-9A-F]{15}$/i.test(v) ||
      /^[0-9A-F]{2}[- ][0-9A-F]{6}[- ][0-9A-F]{6}[- ][0-9A-F]$/i.test(v)
    ) {
      const clean = v.replace(/[- ]/g, "");
      if (/^\d+$/.test(clean)) return { valid: luhn(clean) };
      return { valid: hexCheckValid(clean.toUpperCase()) };
    }

    // Decimal format with check digit (19 digits)
    if (/^\d{19}$/.test(v) || /^\d{5}[- ]\d{5}[- ]\d{4}[- ]\d{4}[- ]\d$/.test(v)) {
      return { valid: luhn(v.replace(/[- ]/g, "")) };
    }

    // Hex/decimal without check digit (14 hex or 18 decimal) — always valid
    if (
      /^[0-9A-F]{14}$/i.test(v) ||
      /^[0-9A-F]{2}[- ][0-9A-F]{6}[- ][0-9A-F]{6}$/i.test(v) ||
      /^\d{18}$/.test(v) ||
      /^\d{5}[- ]\d{5}[- ]\d{4}[- ]\d{4}$/.test(v)
    ) {
      return { valid: true };
    }

    return { valid: false };
  },
});
