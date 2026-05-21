import type { ValidatorFactory } from "../core/types";

export const siret: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    if (!/^\d{14}$/.test(input.value)) return { valid: false };
    let sum = 0;
    for (let i = 0; i < input.value.length; i++) {
      let tmp = Number.parseInt(input.value.charAt(i), 10);
      if (i % 2 === 0) {
        tmp *= 2;
        if (tmp > 9) tmp -= 9;
      }
      sum += tmp;
    }
    return { valid: sum % 10 === 0 };
  },
});
