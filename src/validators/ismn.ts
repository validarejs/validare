import type { ValidatorFactory } from '../core/types';

export const ismn: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === '') return { valid: true };

    let type: 'ISMN10' | 'ISMN13' | null = null;
    switch (true) {
      case /^M\d{9}$/.test(input.value):
      case /^M-\d{4}-\d{4}-\d{1}$/.test(input.value):
      case /^M\s\d{4}\s\d{4}\s\d{1}$/.test(input.value):
        type = 'ISMN10';
        break;
      case /^9790\d{9}$/.test(input.value):
      case /^979-0-\d{4}-\d{4}-\d{1}$/.test(input.value):
      case /^979\s0\s\d{4}\s\d{4}\s\d{1}$/.test(input.value):
        type = 'ISMN13';
        break;
      default:
        return { valid: false };
    }

    // ISMN-10: replace M-prefix with '9790'
    let v = type === 'ISMN10' ? `9790${input.value.substring(1)}` : input.value;
    v = v.replace(/[^0-9]/gi, '');
    const length = v.length;
    const weight = [1, 3];
    let sum = 0;
    for (let i = 0; i < length - 1; i++) {
      sum += parseInt(v.charAt(i), 10) * weight[i % 2];
    }
    sum = (10 - (sum % 10)) % 10;
    return { valid: `${sum}` === v.charAt(length - 1) };
  },
});
