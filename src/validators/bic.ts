import type { ValidatorFactory } from '../core/types';

export const bic: ValidatorFactory = () => ({
  validate(input) {
    return {
      valid:
        input.value === '' ||
        /^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/.test(input.value),
    };
  },
});
