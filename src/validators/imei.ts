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

export const imei: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    switch (true) {
      // 15-digit with optional hyphens or spaces
      case /^\d{15}$/.test(input.value):
      case /^\d{2}-\d{6}-\d{6}-\d{1}$/.test(input.value):
      case /^\d{2}\s\d{6}\s\d{6}\s\d{1}$/.test(input.value):
        return { valid: luhn(input.value.replace(/[^0-9]/g, "")) };
      // 14 or 16 digits (no check digit required), or with optional 2-digit suffix
      case /^\d{14}$/.test(input.value):
      case /^\d{16}$/.test(input.value):
      case /^\d{2}-\d{6}-\d{6}(|-\d{2})$/.test(input.value):
      case /^\d{2}\s\d{6}\s\d{6}(|\s\d{2})$/.test(input.value):
        return { valid: true };
      default:
        return { valid: false };
    }
  },
});
