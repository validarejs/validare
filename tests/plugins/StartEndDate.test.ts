import { describe, it, expect, vi } from 'vitest'
import { validare } from '../../src'
import { StartEndDate } from '../../src/plugins/core/StartEndDate'
import { makeForm } from '../helpers'

const OPTS = {
  format: 'YYYY-MM-DD',
  startDate: { field: 'checkin', message: 'Check-in must be before check-out' },
  endDate: { field: 'checkout', message: 'Check-out must be after check-in' },
}

describe('StartEndDate', () => {
  it('start after end → start field is Invalid', async () => {
    const form = makeForm({ checkin: '2025-12-31', checkout: '2025-12-01' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv.validateField('checkin')
    expect(result).toBe('Invalid')
  })

  it('start before end → start field is Valid', async () => {
    const form = makeForm({ checkin: '2025-12-01', checkout: '2025-12-31' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv.validateField('checkin')
    expect(result).toBe('Valid')
  })

  it('start equals end → Valid (inclusive)', async () => {
    const form = makeForm({ checkin: '2025-12-15', checkout: '2025-12-15' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv.validateField('checkin')
    expect(result).toBe('Valid')
  })

  it('end before start → end field is Invalid', async () => {
    const form = makeForm({ checkin: '2025-12-31', checkout: '2025-12-01' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv.validateField('checkout')
    expect(result).toBe('Invalid')
  })

  it('empty end date → start is Valid (no constraint yet)', async () => {
    const form = makeForm({ checkin: '2025-12-01', checkout: '' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv.validateField('checkin')
    expect(result).toBe('Valid')
  })

  it('supports DD/MM/YYYY format', async () => {
    const form = makeForm({ checkin: '31/12/2025', checkout: '01/12/2025' })
    const fv = validare(form, {
      plugins: {
        dateRange: new StartEndDate({
          format: 'DD/MM/YYYY',
          startDate: { field: 'checkin', message: 'Invalid' },
          endDate: { field: 'checkout', message: 'Invalid' },
        }),
      },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv.validateField('checkin')
    expect(result).toBe('Invalid')
  })

  it('cross-revalidation fires even when field result is Invalid', async () => {
    const form = makeForm({ checkin: '2025-12-31', checkout: '2025-12-01' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const spy = vi.spyOn(fv, 'validateField')
    await fv.validateField('checkin')
    // After checkin validates (Invalid), checkout should also be revalidated
    expect(spy).toHaveBeenCalledWith('checkout')
  })

  it('supports MM/DD/YYYY format', async () => {
    const form = makeForm({ checkin: '12/31/2025', checkout: '12/01/2025' })
    const fv = validare(form, {
      plugins: {
        dateRange: new StartEndDate({
          format: 'MM/DD/YYYY',
          startDate: { field: 'checkin', message: 'Invalid' },
          endDate: { field: 'checkout', message: 'Invalid' },
        }),
      },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv.validateField('checkin')
    expect(result).toBe('Invalid')
  })

  it('supports YYYY/MM/DD format', async () => {
    const form = makeForm({ checkin: '2025/12/31', checkout: '2025/12/01' })
    const fv = validare(form, {
      plugins: {
        dateRange: new StartEndDate({
          format: 'YYYY/MM/DD',
          startDate: { field: 'checkin', message: 'Invalid' },
          endDate: { field: 'checkout', message: 'Invalid' },
        }),
      },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv.validateField('checkin')
    expect(result).toBe('Invalid')
  })

  it('treats overflowed date (2025-02-30) as unparseable → Valid (no constraint)', async () => {
    const form = makeForm({ checkin: '2025-02-30', checkout: '2025-12-01' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    // Feb 30 doesn't exist — parseDate returns NaN → constraint deferred → Valid
    const result = await fv.validateField('checkin')
    expect(result).toBe('Valid')
  })

  it('removes validators on uninstall', async () => {
    const form = makeForm({ checkin: '2025-12-31', checkout: '2025-12-01' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    // Confirm constraint is active before uninstall
    const before = await fv.validateField('checkin')
    expect(before).toBe('Invalid')

    // Uninstall the plugin on the same instance
    fv.deregisterPlugin('dateRange')
    fv.resetField('checkin')

    // After uninstall, cross-field validator removed → Valid
    const after = await fv.validateField('checkin')
    expect(after).toBe('Valid')
  })
})
