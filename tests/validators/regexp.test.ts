import { describe, it, expect } from 'vitest';
import { regexp } from '../../src/validators/regexp';
import { makeInput } from '../helpers';

describe('regexp', () => {
  const v = regexp();

  it('valid when string matches regexp string', () => {
    expect(v.validate(makeInput('abc123', { regexp: '^[a-z0-9]+$' }))).toEqual({ valid: true });
  });

  it('invalid when string does not match', () => {
    expect(v.validate(makeInput('ABC', { regexp: '^[a-z]+$' }))).toEqual({ valid: false });
  });

  it('valid when string matches RegExp object', () => {
    expect(v.validate(makeInput('Hello', { regexp: /^[A-Z]/ }))).toEqual({ valid: true });
  });

  it('supports flags option', () => {
    expect(v.validate(makeInput('HELLO', { regexp: '^hello$', flags: 'i' }))).toEqual({ valid: true });
  });
});
