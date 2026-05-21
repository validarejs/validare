import { describe, it, expect } from 'vitest';
import { stringCase } from '../../src/validators/stringCase';
import { makeInput } from '../helpers';

describe('stringCase', () => {
  const v = stringCase();

  it('valid for uppercase string with case=upper', () => {
    expect(v.validate(makeInput('HELLO', { case: 'upper' }))).toEqual({ valid: true });
  });

  it('invalid for mixed case with case=upper', () => {
    expect(v.validate(makeInput('Hello', { case: 'upper' }))).toEqual({ valid: false });
  });

  it('valid for lowercase string with case=lower', () => {
    expect(v.validate(makeInput('hello', { case: 'lower' }))).toEqual({ valid: true });
  });

  it('invalid for mixed case with case=lower', () => {
    expect(v.validate(makeInput('Hello', { case: 'lower' }))).toEqual({ valid: false });
  });
});
