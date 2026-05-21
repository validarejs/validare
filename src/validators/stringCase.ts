import type { ValidatorFactory } from '../core/types';

export const stringCase: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { case: 'lower' | 'upper' };
    const { value } = input;
    return {
      valid:
        opts.case === 'upper'
          ? value === value.toUpperCase()
          : value === value.toLowerCase(),
    };
  },
});
