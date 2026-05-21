import type { ValidatorFactory, ValidatorInput, ValidatorResult } from '../core/types';

export const callback: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { callback: (input: ValidatorInput) => ValidatorResult };
    return opts.callback(input);
  },
});
