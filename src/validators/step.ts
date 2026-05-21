import type { ValidatorFactory } from '../core/types';

function round(input: number, precision: number): number {
  const m = Math.pow(10, precision);
  const x = input * m;
  const sign = x === 0 ? 0 : x > 0 ? 1 : -1;
  const isHalf = x % 1 === 0.5 * sign;
  return isHalf ? (Math.floor(x) + (sign > 0 ? 1 : 0)) / m : Math.round(x) / m;
}

function floatMod(x: number, y: number): number {
  if (y === 0.0) return 1.0;
  const dotX = `${x}`.split('.');
  const dotY = `${y}`.split('.');
  const precision =
    (dotX.length === 1 ? 0 : dotX[1].length) + (dotY.length === 1 ? 0 : dotY[1].length);
  return round(x - y * Math.floor(x / y), precision);
}

export const step: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === '') return { valid: true };
    const v = parseFloat(input.value);
    if (isNaN(v) || !isFinite(v)) return { valid: false };
    const opts = { baseValue: 0, step: 1, ...input.options } as {
      baseValue: number;
      step: number;
    };
    const mod = floatMod(v - opts.baseValue, opts.step);
    return { valid: mod === 0.0 || mod === opts.step };
  },
});
