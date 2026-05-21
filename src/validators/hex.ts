import type { ValidatorFactory } from '../core/types';

export const hex: ValidatorFactory = () => ({
  validate(input) {
    return {
      valid: input.value === '' || /^[0-9a-fA-F]+$/.test(input.value),
    };
  },
});
