import type { ValidatorFactory } from '../core/types';

export const base64: ValidatorFactory = () => ({
  validate(input) {
    return {
      valid:
        input.value === '' ||
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(
          input.value,
        ),
    };
  },
});
