import { describe, it, expect } from 'vitest';
import { hex } from '../../src/validators/hex';

describe('hex', () => {
  const v = hex();
  it('accepts empty string', () => expect(v.validate({ value: '', options: {}, field: '', elements: [], form: null as never }).valid).toBe(true));
  it('accepts lowercase hex', () => expect(v.validate({ value: 'deadbeef', options: {}, field: '', elements: [], form: null as never }).valid).toBe(true));
  it('accepts uppercase hex', () => expect(v.validate({ value: 'DEADBEEF', options: {}, field: '', elements: [], form: null as never }).valid).toBe(true));
  it('rejects non-hex chars', () => expect(v.validate({ value: 'xyz', options: {}, field: '', elements: [], form: null as never }).valid).toBe(false));
  it('rejects hex with spaces', () => expect(v.validate({ value: 'de ad', options: {}, field: '', elements: [], form: null as never }).valid).toBe(false));
});
