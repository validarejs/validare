import { describe, it, expect } from 'vitest';
import { color } from '../../src/validators/color';

const input = (value: string, type?: string) =>
  ({ value, options: type ? { type } : {}, field: '', elements: [], form: null as never });

describe('color', () => {
  it('accepts empty string', () => expect(color().validate(input('')).valid).toBe(true));
  it('accepts hex color #fff', () => expect(color().validate(input('#fff')).valid).toBe(true));
  it('accepts hex color #ffffff', () => expect(color().validate(input('#ffffff')).valid).toBe(true));
  it('accepts rgb color', () => expect(color().validate(input('rgb(255,0,0)')).valid).toBe(true));
  it('accepts rgba color', () => expect(color().validate(input('rgba(255,0,0,0.5)')).valid).toBe(true));
  it('accepts hsl color', () => expect(color().validate(input('hsl(0,100%,50%)')).valid).toBe(true));
  it('accepts hsla color', () => expect(color().validate(input('hsla(0,100%,50%,1)')).valid).toBe(true));
  it('accepts keyword color', () => expect(color().validate(input('red')).valid).toBe(true));
  it('rejects invalid color', () => expect(color().validate(input('notacolor')).valid).toBe(false));
  it('rejects hex-only type when given rgb', () => expect(color().validate(input('rgb(0,0,0)', 'hex')).valid).toBe(false));
  it('accepts hex-only type with hex value', () => expect(color().validate(input('#abc', 'hex')).valid).toBe(true));
});
