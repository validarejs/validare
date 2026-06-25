import type { ValidatorFactory } from "../core/types";

// RFC 5321 simplified — covers 99.9% of real email addresses
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const email: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { multiple?: boolean };
    if (opts.multiple) {
      const addresses = input.value.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      if (addresses.length === 0) return { valid: false };
      return { valid: addresses.every((addr) => EMAIL_REGEX.test(addr)) };
    }
    return { valid: EMAIL_REGEX.test(input.value) };
  },
});
