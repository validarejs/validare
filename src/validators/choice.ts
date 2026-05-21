import type { ValidatorFactory } from '../core/types';

export const choice: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { min?: number; max?: number };
    const checked = (input.elements as HTMLInputElement[]).filter((el) => el.checked).length;
    if (opts.min !== undefined && checked < opts.min) return { valid: false };
    if (opts.max !== undefined && checked > opts.max) return { valid: false };
    return { valid: true };
  },
});
