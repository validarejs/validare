import { describe, it, expect } from 'vitest';
import { identical } from '../../src/validators/identical';
import { makeForm } from '../helpers';
import type { ValidatorInput } from '../../src/core/types';

describe('identical', () => {
  const v = identical();

  function makeCompareInput(value: string, compareValue: string): ValidatorInput {
    const form = makeForm({ password: value, confirm: compareValue });
    const el = form.querySelector<HTMLInputElement>('[name="password"]')!;
    return {
      value,
      options: { compare: 'confirm' },
      field: 'password',
      elements: [el],
      form,
    };
  }

  it('valid when values match', () => {
    expect(v.validate(makeCompareInput('secret', 'secret'))).toEqual({ valid: true });
  });

  it('invalid when values differ', () => {
    expect(v.validate(makeCompareInput('secret', 'other'))).toEqual({ valid: false });
  });

  it('trims before comparing when trim=true', () => {
    const form = makeForm({ password: ' secret ', confirm: 'secret' });
    const el = form.querySelector<HTMLInputElement>('[name="password"]')!;
    const input: ValidatorInput = {
      value: ' secret ',
      options: { compare: 'confirm', trim: true },
      field: 'password',
      elements: [el],
      form,
    };
    expect(v.validate(input)).toEqual({ valid: true });
  });

  it('invalid when compare field does not exist', () => {
    const form = makeForm({ password: 'abc' });
    const el = form.querySelector<HTMLInputElement>('[name="password"]')!;
    const input: ValidatorInput = {
      value: 'abc',
      options: { compare: 'nonexistent' },
      field: 'password',
      elements: [el],
      form,
    };
    expect(v.validate(input)).toEqual({ valid: false });
  });
});
