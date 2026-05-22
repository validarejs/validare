import type { ValidatorFactory } from "../core/types";

export const stringLength: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { min?: number; max?: number; trim?: boolean };
    const value = opts.trim ? input.value.trim() : input.value;
    const len = value.length;
    if (opts.min !== undefined && len < opts.min) return { valid: false };
    if (opts.max !== undefined && len > opts.max) return { valid: false };
    return { valid: true };
  },
});
