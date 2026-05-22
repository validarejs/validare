import type { ValidatorFactory } from "../core/types";

const PATTERNS: Record<string, RegExp> = {
  "3": /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  "4": /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  "5": /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
};

export const uuid: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    const version = input.options.version != null ? `${input.options.version}` : "all";
    const pattern = PATTERNS[version] ?? PATTERNS.all;
    return { valid: pattern.test(input.value) };
  },
});
