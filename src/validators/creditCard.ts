import type { ValidatorFactory } from '../core/types';

/** Luhn algorithm — https://en.wikipedia.org/wiki/Luhn_algorithm */
function luhn(value: string): boolean {
  const digits = value.split('').map(Number);
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0 && sum > 0;
}

export const creditCard: ValidatorFactory = () => ({
  validate(input) {
    const value = input.value.replace(/[\s-]/g, '');
    if (!/^\d+$/.test(value)) return { valid: false };
    return { valid: luhn(value) };
  },
});
