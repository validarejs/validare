import { describe, it, expect } from 'vitest'
import { validare } from '../../src'
import { Transformer } from '../../src/plugins/core/Transformer'
import { makeForm } from '../helpers'

describe('Transformer', () => {
  it('transforms the value seen by a specific validator', async () => {
    // '(555) 123-4567' fails digits without transform
    const form = makeForm({ phone: '(555) 123-4567' })
    const fv = validare(form, {
      plugins: {
        transformer: new Transformer({
          phone: {
            digits: (_field, element) =>
              (element as HTMLInputElement).value.replace(/\D/g, ''),
          },
        }),
      },
      fields: { phone: { validators: { digits: {} } } },
    })
    const result = await fv.validateField('phone')
    expect(result).toBe('Valid')
  })

  it('does not transform values for other validators on the same field', async () => {
    // empty string → digits transform returns '0', notEmpty sees raw ''
    const form = makeForm({ code: '' })
    const fv = validare(form, {
      plugins: {
        transformer: new Transformer({
          code: {
            digits: (_field, element) =>
              (element as HTMLInputElement).value.replace(/[^0-9]/g, '') || '0',
          },
        }),
      },
      fields: { code: { validators: { notEmpty: {}, digits: {} } } },
    })
    // notEmpty sees '' → Invalid (raw value, not transformed)
    const result = await fv.validateField('code')
    expect(result).toBe('Invalid')
  })

  it('does not transform values for unregistered fields', async () => {
    const form = makeForm({ phone: '(555) 123-4567', email: 'notanemail' })
    const fv = validare(form, {
      plugins: {
        transformer: new Transformer({
          phone: {
            digits: (_field, element) =>
              (element as HTMLInputElement).value.replace(/\D/g, ''),
          },
        }),
      },
      fields: {
        phone: { validators: { digits: {} } },
        email: { validators: { email: {} } },
      },
    })
    // email field has no transform — raw value used → Invalid
    await fv.validateField('phone')
    fv.reset()
    const emailResult = await fv.validateField('email')
    expect(emailResult).toBe('Invalid')
  })

  it('does nothing when disabled', async () => {
    const form = makeForm({ phone: '(555) 123-4567' })
    const fv = validare(form, {
      plugins: {
        transformer: new Transformer({
          phone: {
            digits: (_field, element) =>
              (element as HTMLInputElement).value.replace(/\D/g, ''),
          },
        }),
      },
      fields: { phone: { validators: { digits: {} } } },
    })
    fv.disablePlugin('transformer')
    const result = await fv.validateField('phone')
    // Without transform, raw value fails digits
    expect(result).toBe('Invalid')
  })

  it('removes the filter on uninstall', async () => {
    const form = makeForm({ phone: '(555) 123-4567' })
    const fv = validare(form, {
      plugins: {
        transformer: new Transformer({
          phone: {
            digits: (_field, element) =>
              (element as HTMLInputElement).value.replace(/\D/g, ''),
          },
        }),
      },
      fields: { phone: { validators: { digits: {} } } },
    })
    // With plugin: should be Valid
    const before = await fv.validateField('phone')
    expect(before).toBe('Valid')

    // Uninstall the plugin
    fv.deregisterPlugin('transformer')
    fv.resetField('phone')

    // Without filter: raw value fails digits
    const after = await fv.validateField('phone')
    expect(after).toBe('Invalid')
  })
})
