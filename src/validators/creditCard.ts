import type { ValidatorFactory } from "../core/types";

/** Luhn algorithm — https://en.wikipedia.org/wiki/Luhn_algorithm */
function luhn(value: string): boolean {
  const digits = value.split("").map(Number);
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0 && sum > 0;
}

const CARD_PATTERNS: Array<{ type: string; pattern: RegExp }> = [
  { type: "amex",        pattern: /^3[47]/ },
  { type: "dinersclub",  pattern: /^3(?:0[0-5]|[68])/ },
  { type: "jcb",         pattern: /^35(?:2[89]|[3-8])/ },
  { type: "discover",    pattern: /^6(?:011|4[4-9]|5)/ },
  { type: "maestro",     pattern: /^(?:6304|6759|676[1-3])/ },
  { type: "mastercard",  pattern: /^5[1-5]/ },
  { type: "unionpay",    pattern: /^62/ },
  { type: "visa",        pattern: /^4/ },
];

function detectType(value: string): string {
  for (const { type, pattern } of CARD_PATTERNS) {
    if (pattern.test(value)) return type;
  }
  return "unknown";
}

export const creditCard: ValidatorFactory = () => ({
  validate(input) {
    const value = input.value.replace(/[\s-]/g, "");
    if (!/^\d+$/.test(value)) return { valid: false };
    if (!luhn(value)) return { valid: false };
    return { valid: true, meta: { type: detectType(value) } };
  },
});
