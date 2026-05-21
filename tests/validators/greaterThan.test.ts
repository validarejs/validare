import { describe, it, expect } from 'vitest';
import { greaterThan } from '../../src/validators/greaterThan';
import { makeInput } from '../helpers';

describe('greaterThan', () => {
  const v = greaterThan();

  it('valid when greater than min (inclusive)', () => {
    expect(v.validate(makeInput('5', { min: 3 }))).toEqual({ valid: true });
  });

  it('valid for equal to min (inclusive by default)', () => {
    expect(v.validate(makeInput('3', { min: 3 }))).toEqual({ valid: true });
  });

  it('invalid for less than min', () => {
    expect(v.validate(makeInput('2', { min: 3 }))).toEqual({ valid: false });
  });

  it('invalid for equal to min when inclusive=false', () => {
    expect(v.validate(makeInput('3', { min: 3, inclusive: false }))).toEqual({ valid: false });
  });

  it('invalid for non-numeric', () => {
    expect(v.validate(makeInput('abc', { min: 1 }))).toEqual({ valid: false });
  });
});
