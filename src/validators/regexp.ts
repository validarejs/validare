import type { ValidatorFactory } from "../core/types";

export const regexp: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { regexp: string | RegExp; flags?: string };
    const regex = opts.regexp instanceof RegExp ? opts.regexp : new RegExp(opts.regexp, opts.flags);
    return { valid: regex.test(input.value) };
  },
});
