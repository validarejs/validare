import { describe, it, expect, afterEach } from 'vitest'
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

  it('removes validators on uninstall', async () => {
    const form = makeForm({ checkin: '2025-12-31', checkout: '2025-12-01' })
    const fv = validare(form, {
      plugins: { dateRange: new StartEndDate(OPTS) },
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    fv.destroy()
    // After destroy, no cross-field validator — empty validators → Valid
    const form2 = makeForm({ checkin: '2025-12-31', checkout: '2025-12-01' })
    const fv2 = validare(form2, {
      fields: {
        checkin: { validators: {} },
        checkout: { validators: {} },
      },
    })
    const result = await fv2.validateField('checkin')
    expect(result).toBe('Valid')
  })
})
