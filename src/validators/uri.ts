import type { ValidatorFactory } from "../core/types";

export const uri: ValidatorFactory = () => ({
  validate(input) {
    if (!input.value) return { valid: false };
    try {
      new URL(input.value);
      return { valid: true };
    } catch {
      return { valid: false };
    }
  },
});
