import type { ValidatorFactory } from '../core/types';

export const digits: ValidatorFactory = () => ({
  validate(input) {
    return { valid: /^\d+$/.test(input.value) };
  },
});
