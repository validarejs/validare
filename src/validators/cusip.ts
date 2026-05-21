import type { ValidatorFactory } from "../core/types";

export const cusip: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    const value = input.value.toUpperCase();
    // O and I are not allowed
    if (!/^[0123456789ABCDEFGHJKLMNPQRSTUVWXYZ*@#]{9}$/.test(value)) return { valid: false };
    const lastChar = value[value.length - 1];
    const chars = value.slice(0, 8).split("");
    const converted = chars.map((c) => {
      const code = c.charCodeAt(0);
      if (c === "*") return 36;
      if (c === "@") return 37;
      if (c === "#") return 38;
      if (code >= 65 && code <= 90) return code - 55; // A=10 ... Z=35
      return Number.parseInt(c, 10);
    });
    const sum = converted
      .map((val, i) => {
        const d = i % 2 === 0 ? val : 2 * val;
        return Math.floor(d / 10) + (d % 10);
      })
      .reduce((a, b) => a + b, 0);
    const checkDigit = (10 - (sum % 10)) % 10;
    return { valid: lastChar === `${checkDigit}` };
  },
});
