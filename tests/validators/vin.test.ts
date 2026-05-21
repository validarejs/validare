import { describe, it, expect } from 'vitest';
import { vin } from '../../src/validators/vin';

const input = (value: string) =>
  ({ value, options: {}, field: '', elements: [], form: null as never });

describe('vin', () => {
  it('accepts empty string', () => expect(vin().validate(input('')).valid).toBe(true));
  it('accepts valid VIN', () => expect(vin().validate(input('1HGCM82633A004352')).valid).toBe(true));
  it('accepts VIN with X check digit', () => expect(vin().validate(input('1M8GDM9AXKP042788')).valid).toBe(true));
  it('rejects VIN containing I', () => expect(vin().validate(input('1HGCM826I3A004352')).valid).toBe(false));
  it('rejects VIN with wrong checksum', () => expect(vin().validate(input('1HGCM82633A004353')).valid).toBe(false));
  it('rejects too short', () => expect(vin().validate(input('1HGCM82633A00')).valid).toBe(false));
});
