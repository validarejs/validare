import { describe, it, expect } from 'vitest';
import { stringLength } from '../../src/validators/stringLength';
import { makeInput } from '../helpers';

describe('stringLength', () => {
  const v = stringLength();

  it('valid when length within min/max', () => {
    expect(v.validate(makeInput('hello', { min: 3, max: 10 }))).toEqual({ valid: true });
  });

  it('invalid when shorter than min', () => {
    expect(v.validate(makeInput('hi', { min: 3 }))).toEqual({ valid: false });
  });

  it('invalid when longer than max', () => {
    expect(v.validate(makeInput('hello world', { max: 5 }))).toEqual({ valid: false });
  });

  it('valid with only min', () => {
    expect(v.validate(makeInput('hello', { min: 3 }))).toEqual({ valid: true });
  });

  it('valid with only max', () => {
    expect(v.validate(makeInput('hi', { max: 5 }))).toEqual({ valid: true });
  });

  it('trims before measuring when trim=true', () => {
    expect(v.validate(makeInput('  hi  ', { min: 5, trim: true }))).toEqual({ valid: false });
    expect(v.validate(makeInput('  hi  ', { min: 2, trim: true }))).toEqual({ valid: true });
  });
});
