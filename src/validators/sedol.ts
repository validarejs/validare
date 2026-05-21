import type { ValidatorFactory } from '../core/types';

const SEDOL_WEIGHT = [1, 3, 1, 7, 3, 9, 1];

export const sedol: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === '') return { valid: true };
    const v = input.value.toUpperCase();
    if (!/^[0-9BCDFGHJKLMNPQRSTVWXYZ]{7}$/.test(v)) return { valid: false };
    let sum = 0;
    for (let i = 0; i < v.length - 1; i++) {
      sum += SEDOL_WEIGHT[i] * parseInt(v.charAt(i), 36);
    }
    sum = (10 - (sum % 10)) % 10;
    return { valid: `${sum}` === v.charAt(v.length - 1) };
  },
});
