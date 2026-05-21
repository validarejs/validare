import { describe, it, expect, vi, afterEach } from 'vitest';
import { validare } from '../../src/index';
import { Sequence } from '../../src/plugins/core/Sequence';
import { makeForm } from '../helpers';

afterEach(() => { document.body.innerHTML = ''; });

describe('Sequence', () => {
  it('runs all validators on first validation', async () => {
    const form = makeForm({ name: 'a' });
    const v1 = vi.fn(() => ({ valid: false }));
    const v2 = vi.fn(() => ({ valid: false }));

    const fv = validare(form, {
      plugins: { sequence: new Sequence() },
      fields: { name: { validators: { v1: {}, v2: {} } } },
    });
    fv.registerValidator('v1', () => ({ validate: v1 }));
    fv.registerValidator('v2', () => ({ validate: v2 }));

    await fv.validateField('name');
    expect(v1).toHaveBeenCalled();
    expect(v2).toHaveBeenCalled();
  });

  it('skips later validators after first fails on second run', async () => {
    const form = makeForm({ name: 'a' });
    const v1 = vi.fn(() => ({ valid: false }));
    const v2 = vi.fn(() => ({ valid: true }));

    const fv = validare(form, {
      plugins: { sequence: new Sequence() },
      fields: { name: { validators: { v1: {}, v2: {} } } },
    });
    fv.registerValidator('v1', () => ({ validate: v1 }));
    fv.registerValidator('v2', () => ({ validate: v2 }));

    // First run — both execute
    await fv.validateField('name');
    expect(v2).toHaveBeenCalledTimes(1);

    // Second run — v1 failed last time, so v2 should be skipped
    fv.reset();
    v2.mockClear();
    await fv.validateField('name');
    expect(v2).not.toHaveBeenCalled();
  });
});
