import type { ValidatorFactory } from '../core/types';

// RFC 5321 simplified — covers 99.9% of real email addresses
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const email: ValidatorFactory = () => ({
  validate(input) {
    return { valid: EMAIL_REGEX.test(input.value) };
  },
});
