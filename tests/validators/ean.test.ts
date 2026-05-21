import { describe, it, expect } from 'vitest';
import { ean } from '../../src/validators/ean';

const v = ean();
const inp = (value: string) =>
  ({ value, options: {}, field: '', elements: [], form: null as never });

describe('ean', () => {
  it('accepts empty string', () => expect(v.validate(inp('')).valid).toBe(true));
  it('accepts valid EAN-8', () => expect(v.validate(inp('73513537')).valid).toBe(true));
  it('accepts valid EAN-13', () => expect(v.validate(inp('4006381333931')).valid).toBe(true));
  it('rejects EAN-8 with wrong check digit', () => expect(v.validate(inp('73513530')).valid).toBe(false));
  it('rejects EAN-13 with wrong check digit', () => expect(v.validate(inp('4006381333932')).valid).toBe(false));
  it('rejects non-digit chars', () => expect(v.validate(inp('400638133393A')).valid).toBe(false));
  it('rejects wrong length (9 digits)', () => expect(v.validate(inp('123456789')).valid).toBe(false));
});
