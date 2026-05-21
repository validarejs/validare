import type { ValidatorFactory } from '../core/types';

export const greaterThan: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { min: number; inclusive?: boolean };
    const value = parseFloat(input.value);
    if (isNaN(value)) return { valid: false };
    const inc = opts.inclusive !== false;
    return { valid: inc ? value >= opts.min : value > opts.min };
  },
});
