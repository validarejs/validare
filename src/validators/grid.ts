import type { ValidatorFactory } from "../core/types";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function mod37And36(value: string): boolean {
  const modulus = ALPHABET.length;
  let check = Math.floor(modulus / 2);
  for (let i = 0; i < value.length; i++) {
    check =
      ((((check || modulus) * 2) % (modulus + 1)) + ALPHABET.indexOf(value.charAt(i))) % modulus;
  }
  return check === 1;
}

export const grid: ValidatorFactory = () => ({
  validate(input) {
    if (input.value === "") return { valid: true };
    const v = input.value.toUpperCase();
    if (
      !/^(GRID:)?([0-9A-Z]{2})[-\s]*([0-9A-Z]{5})[-\s]*([0-9A-Z]{10})[-\s]*([0-9A-Z]{1})$/.test(v)
    ) {
      return { valid: false };
    }
    let clean = v.replace(/\s/g, "").replace(/-/g, "");
    if (clean.startsWith("GRID:")) clean = clean.substring(5);
    return { valid: mod37And36(clean) };
  },
});
