import type { ValidatorFactory } from "../core/types";

export const mac: ValidatorFactory = () => ({
  validate(input) {
    return {
      valid:
        input.value === "" ||
        /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(input.value) ||
        /^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$/.test(input.value),
    };
  },
});
