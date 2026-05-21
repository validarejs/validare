import { describe, it, expect, vi, afterEach } from 'vitest';
import { validare } from '../../src/index';
import { Trigger } from '../../src/plugins/core/Trigger';
import { makeForm } from '../helpers';

afterEach(() => { document.body.innerHTML = ''; });

describe('Trigger', () => {
  it('calls validateField when the configured event fires', async () => {
    const form = makeForm({ email: 'test@test.com' });
    const fv = validare(form, {
      plugins: { trigger: new Trigger({ event: 'blur' }) },
      fields: { email: { validators: { notEmpty: {} } } },
    });

    const spy = vi.spyOn(fv, 'validateField');
    const input = form.querySelector<HTMLInputElement>('[name="email"]')!;
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    await Promise.resolve(); // flush microtasks
    expect(spy).toHaveBeenCalledWith('email');
  });

  it('removes event listeners on uninstall (destroy)', () => {
    const form = makeForm({ email: '' });
    const fv = validare(form, {
      plugins: { trigger: new Trigger({ event: 'blur' }) },
      fields: { email: { validators: {} } },
    });
    const spy = vi.spyOn(fv, 'validateField');
    fv.destroy();

    const input = form.querySelector<HTMLInputElement>('[name="email"]')!;
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
  });

  it('attaches listeners to dynamically added fields', async () => {
    const form = makeForm({ email: '' });
    const newInput = document.createElement('input');
    newInput.name = 'phone';
    newInput.value = '123';
    form.appendChild(newInput);

    const fv = validare(form, {
      plugins: { trigger: new Trigger({ event: 'input' }) },
      fields: { email: { validators: {} } },
    });

    fv.addField('phone', { validators: {} });
    const spy = vi.spyOn(fv, 'validateField');
    newInput.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();
    expect(spy).toHaveBeenCalledWith('phone');
  });
});
