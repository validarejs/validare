import { describe, it, expect } from 'vitest';
import { choice } from '../../src/validators/choice';
import type { ValidatorInput } from '../../src/core/types';

function makeCheckboxInput(checkedCount: number, total: number, opts: Record<string, unknown> = {}): ValidatorInput {
  const form = document.createElement('form');
  const elements: HTMLInputElement[] = [];
  for (let i = 0; i < total; i++) {
    const el = document.createElement('input');
    el.type = 'checkbox';
    el.name = 'colors';
    el.value = String(i);
    if (i < checkedCount) el.checked = true;
    form.appendChild(el);
    elements.push(el);
  }
  return {
    value: '',
    options: opts,
    field: 'colors',
    elements,
    form,
  };
}

describe('choice', () => {
  const v = choice();

  it('valid when checked count meets min', () => {
    expect(v.validate(makeCheckboxInput(2, 5, { min: 2 }))).toEqual({ valid: true });
  });

  it('invalid when checked count below min', () => {
    expect(v.validate(makeCheckboxInput(1, 5, { min: 2 }))).toEqual({ valid: false });
  });

  it('valid when checked count at max', () => {
    expect(v.validate(makeCheckboxInput(3, 5, { max: 3 }))).toEqual({ valid: true });
  });

  it('invalid when checked count exceeds max', () => {
    expect(v.validate(makeCheckboxInput(4, 5, { max: 3 }))).toEqual({ valid: false });
  });

  it('valid with no constraints', () => {
    expect(v.validate(makeCheckboxInput(0, 5, {}))).toEqual({ valid: true });
  });
});
