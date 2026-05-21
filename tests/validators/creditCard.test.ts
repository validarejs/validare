import { describe, it, expect } from 'vitest';
import { creditCard } from '../../src/validators/creditCard';
import { makeInput } from '../helpers';

describe('creditCard', () => {
  const v = creditCard();

  it('valid for known-valid Visa test number', () => {
    expect(v.validate(makeInput('4111111111111111'))).toEqual({ valid: true });
  });

  it('valid for known-valid Mastercard test number', () => {
    expect(v.validate(makeInput('5500005555555559'))).toEqual({ valid: true });
  });

  it('valid for number with spaces', () => {
    expect(v.validate(makeInput('4111 1111 1111 1111'))).toEqual({ valid: true });
  });

  it('valid for number with dashes', () => {
    expect(v.validate(makeInput('4111-1111-1111-1111'))).toEqual({ valid: true });
  });

  it('invalid for number that fails Luhn check', () => {
    expect(v.validate(makeInput('4111111111111112'))).toEqual({ valid: false });
  });

  it('invalid for non-numeric input', () => {
    expect(v.validate(makeInput('abc'))).toEqual({ valid: false });
  });

  it('invalid for empty string', () => {
    expect(v.validate(makeInput(''))).toEqual({ valid: false });
  });
});
