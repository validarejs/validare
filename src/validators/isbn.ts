import type { ValidatorFactory } from '../core/types';

export const isbn: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === '') return { valid: true };

    let type: 'ISBN10' | 'ISBN13' | null = null;
    switch (true) {
      case /^\d{9}[\dX]$/.test(input.value):
      case input.value.length === 13 && /^(\d+)-(\d+)-(\d+)-([\dX])$/.test(input.value):
      case input.value.length === 13 && /^(\d+)\s(\d+)\s(\d+)\s([\dX])$/.test(input.value):
        type = 'ISBN10';
        break;
      case /^(978|979)\d{9}[\dX]$/.test(input.value):
      case input.value.length === 17 && /^(978|979)-(\d+)-(\d+)-(\d+)-([\dX])$/.test(input.value):
      case input.value.length === 17 && /^(978|979)\s(\d+)\s(\d+)\s(\d+)\s([\dX])$/.test(input.value):
        type = 'ISBN13';
        break;
      default:
        return { valid: false };
    }

    const chars = input.value.replace(/[^0-9X]/gi, '').split('');
    const length = chars.length;
    let sum = 0;
    let checksum: number | string;

    if (type === 'ISBN10') {
      for (let i = 0; i < length - 1; i++) {
        sum += parseInt(chars[i], 10) * (10 - i);
      }
      checksum = 11 - (sum % 11);
      if (checksum === 11) checksum = 0;
      else if (checksum === 10) checksum = 'X';
      return { valid: `${checksum}` === chars[length - 1] };
    }

    // ISBN13
    for (let i = 0; i < length - 1; i++) {
      sum += parseInt(chars[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    checksum = 10 - (sum % 10);
    if (checksum === 10) checksum = 0;
    return { valid: `${checksum}` === chars[length - 1] };
  },
});
