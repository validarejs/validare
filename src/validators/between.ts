import type { ValidatorFactory } from "../core/types";

export const between: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { min: number; max: number; inclusive?: boolean };
    const value = Number.parseFloat(input.value);
    if (Number.isNaN(value)) return { valid: false };
    const inc = opts.inclusive !== false;
    return {
      valid: inc ? value >= opts.min && value <= opts.max : value > opts.min && value < opts.max,
    };
  },
});
