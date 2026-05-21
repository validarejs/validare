import type { ValidatorFactory } from '../core/types';

export const lessThan: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { max: number; inclusive?: boolean };
    const value = parseFloat(input.value);
    if (isNaN(value)) return { valid: false };
    const inc = opts.inclusive !== false;
    return { valid: inc ? value <= opts.max : value < opts.max };
  },
});
