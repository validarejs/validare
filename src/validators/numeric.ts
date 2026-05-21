import type { ValidatorFactory } from '../core/types';

export const numeric: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { thousandsSeparator?: string; decimalSeparator?: string };
    let value = input.value;
    const thousands = opts.thousandsSeparator ?? '';
    const decimal = opts.decimalSeparator ?? '.';
    if (thousands) value = value.split(thousands).join('');
    if (decimal !== '.') value = value.replace(decimal, '.');
    const n = Number(value);
    return { valid: value !== '' && !isNaN(n) && isFinite(n) };
  },
});
