import { describe, it, expect, afterEach } from 'vitest';
import { validare } from '../../src/index';
import { Icon } from '../../src/plugins/core/Icon';
import { makeForm } from '../helpers';

afterEach(() => { document.body.innerHTML = ''; });

describe('Icon', () => {
  it('inserts icon element after field on validation', async () => {
    const form = makeForm({ email: '' });
    const fv = validare(form, {
      plugins: { icon: new Icon() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    const icon = form.querySelector('.fv-plugins-icon');
    expect(icon).not.toBeNull();
  });

  it('adds invalid class on failed validation', async () => {
    const form = makeForm({ email: '' });
    const fv = validare(form, {
      plugins: { icon: new Icon() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    const icon = form.querySelector('.fv-plugins-icon');
    expect(icon!.classList.contains('fv-plugins-icon--invalid')).toBe(true);
    expect(icon!.classList.contains('fv-plugins-icon--valid')).toBe(false);
  });

  it('adds valid class on successful validation', async () => {
    const form = makeForm({ email: 'test@test.com' });
    const fv = validare(form, {
      plugins: { icon: new Icon() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    const icon = form.querySelector('.fv-plugins-icon');
    expect(icon!.classList.contains('fv-plugins-icon--valid')).toBe(true);
    expect(icon!.classList.contains('fv-plugins-icon--invalid')).toBe(false);
  });

  it('removes icon elements on uninstall', async () => {
    const form = makeForm({ email: '' });
    const fv = validare(form, {
      plugins: { icon: new Icon() },
      fields: { email: { validators: {} } },
    });
    await fv.validate();
    fv.destroy();
    expect(form.querySelector('.fv-plugins-icon')).toBeNull();
  });
});
