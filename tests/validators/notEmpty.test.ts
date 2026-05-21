import { describe, it, expect } from 'vitest';
import { notEmpty } from '../../src/validators/notEmpty';
import { makeInput } from '../helpers';

describe('notEmpty', () => {
  const v = notEmpty();

  it('valid for non-empty string', () => {
    expect(v.validate(makeInput('hello'))).toEqual({ valid: true });
  });

  it('invalid for empty string', () => {
    expect(v.validate(makeInput(''))).toEqual({ valid: false });
  });

  it('invalid for whitespace-only when trim=true', () => {
    expect(v.validate(makeInput('   ', { trim: true }))).toEqual({ valid: false });
  });

  it('valid for whitespace-only when trim=false (default)', () => {
    expect(v.validate(makeInput('   '))).toEqual({ valid: true });
  });

  it('valid for "0"', () => {
    expect(v.validate(makeInput('0'))).toEqual({ valid: true });
  });
});
