import { describe, it, expect } from 'vitest';
import { isbn } from '../../src/validators/isbn';

const v = isbn();
const inp = (value: string) =>
  ({ value, options: {}, field: '', elements: [], form: null as never });

describe('isbn', () => {
  it('accepts empty string', () => expect(v.validate(inp('')).valid).toBe(true));
  // ISBN-10
  it('accepts valid ISBN-10 digits only', () => expect(v.validate(inp('0306406152')).valid).toBe(true));
  it('accepts valid ISBN-10 with X check', () => expect(v.validate(inp('817450494X')).valid).toBe(true));
  it('accepts valid ISBN-10 with hyphens', () => expect(v.validate(inp('0-306-40615-2')).valid).toBe(true));
  it('rejects ISBN-10 with wrong check digit', () => expect(v.validate(inp('0306406153')).valid).toBe(false));
  // ISBN-13
  it('accepts valid ISBN-13 digits only', () => expect(v.validate(inp('9780306406157')).valid).toBe(true));
  it('accepts valid ISBN-13 with hyphens', () => expect(v.validate(inp('978-0-306-40615-7')).valid).toBe(true));
  it('rejects ISBN-13 with wrong check digit', () => expect(v.validate(inp('9780306406158')).valid).toBe(false));
  // Invalid
  it('rejects random string', () => expect(v.validate(inp('notanisbn')).valid).toBe(false));
});
