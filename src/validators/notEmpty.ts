import type { ValidatorFactory } from '../core/types';

export const notEmpty: ValidatorFactory = () => ({
  validate(input) {
    const trim = !!(input.options as { trim?: boolean }).trim;
    const { value } = input;
    const valid = trim ? value.trim() !== '' : value !== '';
    return { valid };
  },
});
