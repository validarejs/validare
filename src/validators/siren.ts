import type { ValidatorFactory } from "../core/types";

const LUHN_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
];

function luhn(value: string): boolean {
  let mul = 0;
  let sum = 0;
  let length = value.length;
  while (length--) {
    sum += LUHN_TABLE[mul][Number.parseInt(value.charAt(length), 10)];
    mul = 1 - mul;
  }
  return sum % 10 === 0 && sum > 0;
}

export const siren: ValidatorFactory = () => ({
  validate(input) {
    return {
      valid: input.value === "" || (/^\d{9}$/.test(input.value) && luhn(input.value)),
    };
  },
});
