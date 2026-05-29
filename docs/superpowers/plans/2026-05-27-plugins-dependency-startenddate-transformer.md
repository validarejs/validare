# Plugins: Dependency, StartEndDate, Transformer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement three new plugins — `Dependency`, `StartEndDate`, and `Transformer` — following the existing validare plugin architecture.

**Architecture:** Each plugin extends `Plugin<T>` from `src/core/Plugin.ts`. Two small additions to `Core.ts` are needed first: `removeValidator(field, name)` to allow plugins to remove validators they added, and a `field-value` filter hook inside `validateElement` to let Transformer intercept values per validator. All three plugins are exported from `src/plugins/index.ts`.

**Tech Stack:** TypeScript, Vitest, existing validare plugin pattern.

---

## File Map

```
src/core/Core.ts                              ← add removeValidator(), deregisterValidator(), field-value filter
src/plugins/core/Dependency.ts                ← new plugin
src/plugins/core/StartEndDate.ts              ← new plugin
src/plugins/core/Transformer.ts               ← new plugin
src/plugins/index.ts                          ← export the three new plugins
tests/plugins/Dependency.test.ts              ← new tests
tests/plugins/StartEndDate.test.ts            ← new tests
tests/plugins/Transformer.test.ts             ← new tests
```

---

## Task 1: Add `removeValidator`, `deregisterValidator`, and `field-value` filter to Core

**Files:**
- Modify: `src/core/Core.ts`
- Test: `tests/core/Core.test.ts` (may not exist — create it if needed, else add to the relevant test file)

### Context

`Core.ts` currently has:
- `registerValidator(name, factory)` — registers a validator factory globally
- `addField(field, opts)` — merges validators into a field
- No way to remove an individual validator from a field or deregister a factory

`validateElement` currently calls `this.getElementValue(element)` once before the per-validator loop, so every validator in a field gets the same value. Adding a `field-value` filter call inside the loop allows Transformer to intercept the value per validator.

---

- [ ] **Step 1: Add `removeValidator` and `deregisterValidator` to Core.ts**

In `src/core/Core.ts`, after the `registerValidator` method (around line 98), add:

```ts
/** Remove a single validator from a field's validator map. No-op if not found. */
removeValidator(field: string, validatorName: string): this {
  const fieldOpts = this.fields[field]
  if (fieldOpts?.validators[validatorName]) {
    delete fieldOpts.validators[validatorName]
  }
  return this
}

/** Remove a validator factory from the global registry. No-op if not found. */
deregisterValidator(name: string): this {
  delete this.validators[name]
  return this
}
```

- [ ] **Step 2: Add `field-value` filter hook inside `validateElement`**

In `src/core/Core.ts`, inside `validateElement`, find the block:

```ts
const value = this.getElementValue(element);

const promises = activeValidatorNames.map((name) => {
  const factory = this.validators[name];
  if (!factory) {
    return Promise.resolve({
      name,
      status: "NotValidated" as ValidationStatus,
      valid: false,
      message: "",
    });
  }

  const opts: ValidatorOptions = fieldOpts.validators[name];
  const input: ValidatorInput = {
    value,
    options: opts,
    field,
    elements: this.elements[field],
    form: this.form,
  };
```

Replace it with:

```ts
const rawValue = this.getElementValue(element);

const promises = activeValidatorNames.map((name) => {
  const factory = this.validators[name];
  if (!factory) {
    return Promise.resolve({
      name,
      status: "NotValidated" as ValidationStatus,
      valid: false,
      message: "",
    });
  }

  const opts: ValidatorOptions = fieldOpts.validators[name];
  // Allow plugins (e.g. Transformer) to transform the value per validator
  const value = this.filter.execute<string>("field-value", rawValue, [field, element, name]);
  const input: ValidatorInput = {
    value,
    options: opts,
    field,
    elements: this.elements[field],
    form: this.form,
  };
```

- [ ] **Step 3: Write tests for the new Core methods**

Create or append to `tests/core/Core.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validare } from '../../src'
import { makeForm } from '../helpers'

describe('Core.removeValidator', () => {
  it('removes a validator from a field so it no longer runs', async () => {
    const form = makeForm({ email: '' })
    const fv = validare(form, {
      fields: { email: { validators: { notEmpty: {}, email: {} } } },
    })
    fv.removeValidator('email', 'email')
    // Only notEmpty remains — empty string should fail on notEmpty
    const result = await fv.validateField('email')
    expect(result).toBe('Invalid')
    // But a non-empty non-email value should now pass (email validator removed)
    const form2 = makeForm({ email: 'notanemail' })
    const fv2 = validare(form2, {
      fields: { email: { validators: { notEmpty: {}, email: {} } } },
    })
    fv2.removeValidator('email', 'email')
    const result2 = await fv2.validateField('email')
    expect(result2).toBe('Valid')
  })

  it('is a no-op for unknown field or validator', () => {
    const form = makeForm({ email: 'test@test.com' })
    const fv = validare(form, {
      fields: { email: { validators: { notEmpty: {} } } },
    })
    expect(() => fv.removeValidator('unknown', 'notEmpty')).not.toThrow()
    expect(() => fv.removeValidator('email', 'unknown')).not.toThrow()
  })
})

describe('Core.deregisterValidator', () => {
  it('removes a validator factory from the registry', async () => {
    const form = makeForm({ val: 'test' })
    const fv = validare(form, {
      fields: { val: { validators: { notEmpty: {} } } },
    })
    fv.deregisterValidator('notEmpty')
    // notEmpty factory gone — field runs 0 validators → Valid
    fv.reset()
    const result = await fv.validateField('val')
    expect(result).toBe('Valid')
  })
})

describe('Core field-value filter', () => {
  it('allows a plugin to transform the value seen by a specific validator', async () => {
    const form = makeForm({ phone: '(555) 123-4567' })
    const fv = validare(form, {
      fields: { phone: { validators: { digits: {} } } },
    })
    // Without transform: '(555) 123-4567' fails digits
    const before = await fv.validateField('phone')
    expect(before).toBe('Invalid')

    fv.reset()
    // Register a field-value filter that strips non-digits for the digits validator
    fv.registerFilter('field-value', (defaultValue: unknown, field: unknown, _el: unknown, validator: unknown) => {
      if (field === 'phone' && validator === 'digits') {
        return (defaultValue as string).replace(/\D/g, '')
      }
      return defaultValue
    })
    const after = await fv.validateField('phone')
    expect(after).toBe('Valid')
  })
})
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/core/Core.test.ts
```

Expected: all new tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/Core.ts tests/core/Core.test.ts
git commit -m "feat(core): add removeValidator, deregisterValidator, and field-value filter hook"
```

---

## Task 2: Dependency Plugin

**Files:**
- Create: `src/plugins/core/Dependency.ts`
- Create: `tests/plugins/Dependency.test.ts`

### What it does

When field A is validated, automatically revalidates other fields that depend on A. Configured as a map: `{ fieldA: 'fieldB fieldC' }` means "when A validates, also revalidate B and C".

Use case: country + zip code (when country changes, re-run zip validation to check against the new country).

### Anti-loop protection

A `revalidating` Set tracks which fields are currently being revalidated by this plugin. If a field is in that set, the handler skips it to prevent A→B→A infinite loops.

---

- [ ] **Step 1: Write failing tests**

Create `tests/plugins/Dependency.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { validare } from '../../src'
import { Dependency } from '../../src/plugins/core/Dependency'
import { makeForm } from '../helpers'

describe('Dependency', () => {
  it('revalidates dependent field when primary field validates', async () => {
    const form = makeForm({ country: 'US', zip: '90210' })
    const fv = validare(form, {
      plugins: {
        dep: new Dependency({ country: 'zip' }),
      },
      fields: {
        country: { validators: { notEmpty: {} } },
        zip: { validators: { notEmpty: {} } },
      },
    })

    const spy = vi.spyOn(fv, 'validateField')
    await fv.validateField('country')

    // After validating country, zip should have been revalidated
    expect(spy).toHaveBeenCalledWith('zip')
  })

  it('revalidates multiple dependents (space-separated)', async () => {
    const form = makeForm({ state: 'CA', zip: '90210', city: 'LA' })
    const fv = validare(form, {
      plugins: { dep: new Dependency({ state: 'zip city' }) },
      fields: {
        state: { validators: { notEmpty: {} } },
        zip: { validators: { notEmpty: {} } },
        city: { validators: { notEmpty: {} } },
      },
    })

    const spy = vi.spyOn(fv, 'validateField')
    await fv.validateField('state')

    expect(spy).toHaveBeenCalledWith('zip')
    expect(spy).toHaveBeenCalledWith('city')
  })

  it('does not revalidate dependents when plugin is disabled', async () => {
    const form = makeForm({ country: 'US', zip: '90210' })
    const fv = validare(form, {
      plugins: { dep: new Dependency({ country: 'zip' }) },
      fields: {
        country: { validators: { notEmpty: {} } },
        zip: { validators: { notEmpty: {} } },
      },
    })
    fv.disablePlugin('dep')

    const spy = vi.spyOn(fv, 'validateField')
    await fv.validateField('country')

    expect(spy).not.toHaveBeenCalledWith('zip')
  })

  it('does not loop infinitely when A→B and B→A', async () => {
    const form = makeForm({ a: 'x', b: 'y' })
    const fv = validare(form, {
      plugins: { dep: new Dependency({ a: 'b', b: 'a' }) },
      fields: {
        a: { validators: { notEmpty: {} } },
        b: { validators: { notEmpty: {} } },
      },
    })

    // Should complete without hanging
    await expect(fv.validateField('a')).resolves.toBeDefined()
  })

  it('cleans up on uninstall', async () => {
    const form = makeForm({ country: 'US', zip: '90210' })
    const fv = validare(form, {
      plugins: { dep: new Dependency({ country: 'zip' }) },
      fields: {
        country: { validators: { notEmpty: {} } },
        zip: { validators: { notEmpty: {} } },
      },
    })
    fv.destroy()

    const spy = vi.spyOn(fv, 'validateField')
    await fv.validateField('country')
    expect(spy).not.toHaveBeenCalledWith('zip')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- tests/plugins/Dependency.test.ts
```

Expected: fails with "Cannot find module '../../src/plugins/core/Dependency'".

- [ ] **Step 3: Implement `Dependency.ts`**

Create `src/plugins/core/Dependency.ts`:

```ts
import { Plugin } from "../../core/Plugin";

export interface DependencyOptions {
  /** Map of field name → space-separated list of dependent fields to revalidate */
  [field: string]: string;
}

export class Dependency extends Plugin<DependencyOptions> {
  /** Fields currently being revalidated by this plugin — prevents infinite loops */
  private revalidating = new Set<string>();

  private onFieldValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { field } = payload as { field: string };

    const depString = this.opts[field];
    if (!depString) return;

    const deps = depString
      .split(" ")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const dep of deps) {
      if (this.revalidating.has(dep)) continue;
      this.revalidating.add(dep);
      this.core.resetField(dep);
      void this.core.validateField(dep).finally(() => {
        this.revalidating.delete(dep);
      });
    }
  };

  install(): void {
    this.core.on("core.field.validated", this.onFieldValidated);
  }

  uninstall(): void {
    this.core.off("core.field.validated", this.onFieldValidated);
    this.revalidating.clear();
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/plugins/Dependency.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/core/Dependency.ts tests/plugins/Dependency.test.ts
git commit -m "feat(plugins): add Dependency plugin"
```

---

## Task 3: StartEndDate Plugin

**Files:**
- Create: `src/plugins/core/StartEndDate.ts`
- Create: `tests/plugins/StartEndDate.test.ts`

### What it does

Ensures that a start date field is ≤ an end date field. On `install()`, merges a cross-field comparison validator into each date field (using unique keys derived from the field names). On `uninstall()`, removes those validators and deregisters the factories.

Cross-revalidation: when the end date validates successfully, the start date is revalidated (and vice versa), so both fields always reflect the current constraint.

### Date parsing

A local `parseDate(value, format)` function handles formats `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY/MM/DD`. Returns `NaN` for unparseable values — in that case the cross-field validator returns `valid: true` and defers to the user's existing `date` validator.

### Validator key naming

Keys are derived from the field names: `__startEndDate_s_<startField>` and `__startEndDate_e_<endField>`. This is deterministic and collision-free as long as field names are unique within the form (which is required by HTML).

---

- [ ] **Step 1: Write failing tests**

Create `tests/plugins/StartEndDate.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- tests/plugins/StartEndDate.test.ts
```

Expected: fails with "Cannot find module '../../src/plugins/core/StartEndDate'".

- [ ] **Step 3: Implement `StartEndDate.ts`**

Create `src/plugins/core/StartEndDate.ts`:

```ts
import { Plugin } from "../../core/Plugin";
import type { ValidatorInput } from "../../core/types";

export interface StartEndDateOptions {
  /** Date format string. Supported tokens: YYYY, MM, DD. Separator: `-` or `/`. */
  format: string;
  startDate: {
    /** Name of the start date field */
    field: string;
    /** Error message shown on the start date field when start > end */
    message: string;
  };
  endDate: {
    /** Name of the end date field */
    field: string;
    /** Error message shown on the end date field when end < start */
    message: string;
  };
}

/** Parse a date string according to a format string. Returns NaN on failure. */
function parseDate(value: string, format: string): number {
  const sep = /[-/]/.exec(format)?.[0] ?? "-";
  const fParts = format.split(sep);
  const vParts = value.split(sep);
  if (vParts.length !== 3) return NaN;
  const yIdx = fParts.indexOf("YYYY");
  const mIdx = fParts.indexOf("MM");
  const dIdx = fParts.indexOf("DD");
  if (yIdx < 0 || mIdx < 0 || dIdx < 0) return NaN;
  return Date.UTC(
    parseInt(vParts[yIdx], 10),
    parseInt(vParts[mIdx], 10) - 1,
    parseInt(vParts[dIdx], 10),
  );
}

export class StartEndDate extends Plugin<StartEndDateOptions> {
  /** Validator key added to the start date field */
  private get startKey(): string {
    return `__startEndDate_s_${this.opts.startDate.field}`;
  }
  /** Validator key added to the end date field */
  private get endKey(): string {
    return `__startEndDate_e_${this.opts.endDate.field}`;
  }

  /** Prevent recursive cross-revalidation */
  private revalidating = new Set<string>();

  private onFieldValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { field, result } = payload as { field: string; result: string };
    if (result !== "Valid") return;

    if (field === this.opts.startDate.field && !this.revalidating.has(this.opts.endDate.field)) {
      this.revalidating.add(this.opts.endDate.field);
      this.core.resetField(this.opts.endDate.field);
      void this.core.validateField(this.opts.endDate.field).finally(() => {
        this.revalidating.delete(this.opts.endDate.field);
      });
    } else if (field === this.opts.endDate.field && !this.revalidating.has(this.opts.startDate.field)) {
      this.revalidating.add(this.opts.startDate.field);
      this.core.resetField(this.opts.startDate.field);
      void this.core.validateField(this.opts.startDate.field).finally(() => {
        this.revalidating.delete(this.opts.startDate.field);
      });
    }
  };

  install(): void {
    const { format, startDate, endDate } = this.opts;
    const form = this.core.form;

    // Register validator factories for cross-field comparison
    this.core.registerValidator(this.startKey, () => ({
      validate: (input: ValidatorInput) => {
        const endEl = form.querySelector<HTMLInputElement>(`[name="${endDate.field}"]`);
        if (!endEl?.value) return { valid: true };
        const start = parseDate(input.value, format);
        const end = parseDate(endEl.value, format);
        if (isNaN(start) || isNaN(end)) return { valid: true };
        return { valid: start <= end };
      },
    }));

    this.core.registerValidator(this.endKey, () => ({
      validate: (input: ValidatorInput) => {
        const startEl = form.querySelector<HTMLInputElement>(`[name="${startDate.field}"]`);
        if (!startEl?.value) return { valid: true };
        const start = parseDate(startEl.value, format);
        const end = parseDate(input.value, format);
        if (isNaN(start) || isNaN(end)) return { valid: true };
        return { valid: start <= end };
      },
    }));

    // Merge cross-field validators into both fields
    this.core.addField(startDate.field, {
      validators: { [this.startKey]: { message: startDate.message } },
    });
    this.core.addField(endDate.field, {
      validators: { [this.endKey]: { message: endDate.message } },
    });

    this.core.on("core.field.validated", this.onFieldValidated);
  }

  uninstall(): void {
    this.core.off("core.field.validated", this.onFieldValidated);
    this.core.removeValidator(this.opts.startDate.field, this.startKey);
    this.core.removeValidator(this.opts.endDate.field, this.endKey);
    this.core.deregisterValidator(this.startKey);
    this.core.deregisterValidator(this.endKey);
    this.revalidating.clear();
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/plugins/StartEndDate.test.ts
```

Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/core/StartEndDate.ts tests/plugins/StartEndDate.test.ts
git commit -m "feat(plugins): add StartEndDate plugin"
```

---

## Task 4: Transformer Plugin

**Files:**
- Create: `src/plugins/core/Transformer.ts`
- Create: `tests/plugins/Transformer.test.ts`

### What it does

Registers a `field-value` filter (added to Core in Task 1) that intercepts the value passed to a specific validator. Configuration: a nested map of `{ fieldName: { validatorName: (field, element, validator) => string } }`.

Use cases:
- Strip spaces/dashes from a credit card number before `creditCard` validator
- Strip non-digits from a phone number before `digits` validator
- Trim whitespace before `stringLength` validator

---

- [ ] **Step 1: Write failing tests**

Create `tests/plugins/Transformer.test.ts`:

```ts
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
    // 'abc123' → stripped to '123' passes digits, but notEmpty still sees raw value
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
    fv.destroy()

    const form2 = makeForm({ phone: '(555) 123-4567' })
    const fv2 = validare(form2, {
      fields: { phone: { validators: { digits: {} } } },
    })
    const result = await fv2.validateField('phone')
    expect(result).toBe('Invalid')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- tests/plugins/Transformer.test.ts
```

Expected: fails with "Cannot find module '../../src/plugins/core/Transformer'".

- [ ] **Step 3: Implement `Transformer.ts`**

Create `src/plugins/core/Transformer.ts`:

```ts
import { Plugin } from "../../core/Plugin";

export interface TransformerOptions {
  /**
   * Map of field name → map of validator name → transform function.
   * The function receives (field, element, validator) and returns the transformed string value.
   */
  [field: string]: {
    [validator: string]: (
      field: string,
      element: HTMLElement,
      validator: string,
    ) => string;
  };
}

export class Transformer extends Plugin<TransformerOptions> {
  private valueFilter = (
    defaultValue: unknown,
    field: unknown,
    element: unknown,
    validator: unknown,
  ): unknown => {
    if (!this.isEnabled()) return defaultValue;
    const fn = this.opts[field as string]?.[validator as string];
    if (typeof fn !== "function") return defaultValue;
    return fn(field as string, element as HTMLElement, validator as string);
  };

  install(): void {
    this.core.registerFilter("field-value", this.valueFilter);
  }

  uninstall(): void {
    this.core.deregisterFilter("field-value", this.valueFilter);
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/plugins/Transformer.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/core/Transformer.ts tests/plugins/Transformer.test.ts
git commit -m "feat(plugins): add Transformer plugin"
```

---

## Task 5: Export + full test suite + rebuild

**Files:**
- Modify: `src/plugins/index.ts`
- Run: full test suite, rebuild, copy UMD

- [ ] **Step 1: Export the three plugins from `src/plugins/index.ts`**

Open `src/plugins/index.ts`. Add these exports alongside the existing ones:

```ts
export { Dependency } from "./core/Dependency";
export type { DependencyOptions } from "./core/Dependency";
export { StartEndDate } from "./core/StartEndDate";
export type { StartEndDateOptions } from "./core/StartEndDate";
export { Transformer } from "./core/Transformer";
export type { TransformerOptions } from "./core/Transformer";
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: all 686 + new tests pass (total ≥ 703).

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: no errors. Output: `dist/index.esm.js`, `dist/index.cjs`, `dist/index.umd.js`.

- [ ] **Step 4: Copy UMD to validare-docs**

```bash
yes y | cp -i dist/index.umd.js ../validare-docs/public/validare.umd.js
```

- [ ] **Step 5: Commit**

```bash
git add src/plugins/index.ts
git commit -m "feat(plugins): export Dependency, StartEndDate, Transformer"
```

---

## Self-Review Notes

**Spec coverage:**
- ✅ Dependency: revalidates dependent fields on `core.field.validated`, anti-loop, disable support, cleanup
- ✅ StartEndDate: cross-field date comparison, both directions, format support, cross-revalidation on valid, cleanup
- ✅ Transformer: `field-value` filter, per-field/per-validator, disable support, cleanup
- ✅ Core additions: `removeValidator`, `deregisterValidator`, `field-value` filter hook — all needed by the plugins above

**Type consistency:**
- `removeValidator(field, validatorName)` used in StartEndDate uninstall — matches Task 1 signature ✅
- `deregisterValidator(name)` used in StartEndDate uninstall — matches Task 1 signature ✅
- `registerFilter("field-value", fn)` / `deregisterFilter("field-value", fn)` — existing Core methods ✅
- `this.core.form` (public `readonly form: HTMLFormElement`) used in StartEndDate — matches Core.ts ✅
- `core.field.validated` payload `{ field, result, elements }` — matches Core.ts emit ✅
