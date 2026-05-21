import type { ValidatorFactory } from "../core/types";

export const imo: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    if (!/^IMO \d{7}$/i.test(input.value)) return { valid: false };
    const digits = input.value.replace(/^.*(\d{7})$/, "$1");
    let sum = 0;
    for (let i = 6; i >= 1; i--) {
      sum += Number.parseInt(digits.charAt(6 - i), 10) * (i + 1);
    }
    return { valid: sum % 10 === Number.parseInt(digits.charAt(6), 10) };
  },
});
