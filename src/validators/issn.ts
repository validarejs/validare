import type { ValidatorFactory } from "../core/types";

export const issn: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    if (!/^\d{4}-\d{3}[\dX]$/.test(input.value)) return { valid: false };
    const chars = input.value.replace(/[^0-9X]/gi, "").split("");
    if (chars[7] === "X") chars[7] = "10";
    let sum = 0;
    for (let i = 0; i < chars.length; i++) {
      sum += Number.parseInt(chars[i], 10) * (8 - i);
    }
    return { valid: sum % 11 === 0 };
  },
});
