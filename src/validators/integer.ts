import type { ValidatorFactory } from '../core/types';

export const integer: ValidatorFactory = () => ({
  validate(input) {
    return { valid: /^-?\d+$/.test(input.value) };
  },
});
