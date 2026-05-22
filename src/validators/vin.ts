import type { ValidatorFactory } from "../core/types";

const TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export const vin: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    if (!/^[a-hj-npr-z0-9]{8}[0-9xX][a-hj-npr-z0-9]{8}$/i.test(input.value)) {
      return { valid: false };
    }
    const v = input.value.toUpperCase();
    let sum = 0;
    for (let i = 0; i < v.length; i++) {
      sum += TRANSLITERATION[v[i]] * WEIGHTS[i];
    }
    let remainder = `${sum % 11}`;
    if (remainder === "10") remainder = "X";
    return { valid: remainder === v[8] };
  },
});
