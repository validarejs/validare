import type { ValidatorFactory, ValidatorInput, ValidatorResult } from "../core/types";

export const promise: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { promise: (input: ValidatorInput) => Promise<ValidatorResult> };
    return opts.promise(input);
  },
});
