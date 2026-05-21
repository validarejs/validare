import { describe, it, expect } from 'vitest';
import { bic } from '../../src/validators/bic';

describe('bic', () => {
  const v = bic();
  it('accepts empty string', () => expect(v.validate({ value: '', options: {}, field: '', elements: [], form: null as never }).valid).toBe(true));
  it('accepts 8-char BIC', () => expect(v.validate({ value: 'DEUTDEDB', options: {}, field: '', elements: [], form: null as never }).valid).toBe(true));
  it('accepts 11-char BIC', () => expect(v.validate({ value: 'DEUTDEDBFRA', options: {}, field: '', elements: [], form: null as never }).valid).toBe(true));
  it('rejects too short', () => expect(v.validate({ value: 'DEUT', options: {}, field: '', elements: [], form: null as never }).valid).toBe(false));
  it('rejects invalid chars', () => expect(v.validate({ value: 'DEUT!EDB', options: {}, field: '', elements: [], form: null as never }).valid).toBe(false));
});
