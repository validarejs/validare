import { describe, it, expect, afterEach } from 'vitest';
import { validare } from '../../src/index';
import { Tailwind } from '../../src/plugins/frameworks/Tailwind';
import { makeForm } from '../helpers';

afterEach(() => { document.body.innerHTML = ''; });

describe('Tailwind', () => {
  it('applies custom invalid classes', async () => {
    const form = makeForm({ name: '' });
    const fv = validare(form, {
      plugins: {
        ui: new Tailwind({
          invalidClass: 'border-red-500 focus:ring-red-500',
          validClass: 'border-green-500 focus:ring-green-500',
        }),
      },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    const input = form.querySelector('[name="name"]')!;
    expect(input.classList.contains('border-red-500')).toBe(true);
  });

  it('applies custom valid classes', async () => {
    const form = makeForm({ name: 'Alice' });
    const fv = validare(form, {
      plugins: {
        ui: new Tailwind({
          invalidClass: 'border-red-500',
          validClass: 'border-green-500',
        }),
      },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    const input = form.querySelector('[name="name"]')!;
    expect(input.classList.contains('border-green-500')).toBe(true);
  });
});
