# Sequence + Message: First-Error-Only Display — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Sequence plugin to correctly show only the first error on the very first validation run, and add a `first: true` option to the Message plugin for cases where only one error should show regardless of Sequence.

**Architecture:**
- **Option B (Sequence fix):** Add an `element-validated` post-validation filter hook to Core, then have Sequence register a handler that trims the validators map to only the first failing validator by definition order. This fixes the first-run problem where `previousResults` is empty.
- **Option A (Message `first`):** Add a `first?: boolean` option to Message that slices the error list to 1 at render time. Independent of Sequence.

**Tech Stack:** TypeScript, Vitest, existing validare plugin/filter pattern.

---

## File Map

```
src/core/Core.ts                     ← add element-validated filter hook (1 line change)
src/plugins/core/Sequence.ts         ← add trimToFirstFailure filter
src/plugins/core/Message.ts          ← add first?: boolean option
tests/plugins/Sequence.test.ts       ← add first-run test
tests/plugins/Message.test.ts        ← add first:true tests
CLAUDE.md                            ← document element-validated filter
validare-docs/plugins/Sequence.md    ← fix playground example
validare-docs/plugins/Message.md     ← document first option
```

---

## Task 1: Add `element-validated` filter hook to Core + fix Sequence

**Files:**
- Modify: `src/core/Core.ts` (line 328)
- Modify: `src/plugins/core/Sequence.ts`
- Modify: `tests/plugins/Sequence.test.ts`

### Context

**Current Core.ts at line 328:**
```ts
      this.emit("core.element.validated", payload);
      return status;
```

**Current Sequence.ts structure:**
- `private previousResults` — stores validator results from previous complete run
- `private onValidatorValidated` — updates `previousResults` on `core.validator.validated`
- `private shouldValidate` — `field-should-validate` filter; uses `previousResults` to skip validators after first failure in runs 2+
- `install()` — registers `onValidatorValidated` + `shouldValidate` filter
- `uninstall()` — deregisters both

**The bug:** On run 1, `previousResults` is empty → `shouldValidate` returns true for all → all validators run → multiple messages shown.

**The fix:** Add a post-validation filter `element-validated` to Core. Sequence registers a handler that finds the first failing validator (by definition order in the field config) and clears the messages of all subsequent failures. This is purely a display-layer fix — validator results stay intact, only messages are cleared.

---

- [ ] **Step 1: Add `element-validated` filter to Core.ts**

In `src/core/Core.ts`, find line 328:
```ts
      this.emit("core.element.validated", payload);
      return status;
```

Replace with:
```ts
      const finalPayload = this.filter.execute<ElementValidatedPayload>(
        "element-validated",
        payload,
        [],
      );
      this.emit("core.element.validated", finalPayload);
      return status;
```

No other changes to Core.ts.

- [ ] **Step 2: Add `trimToFirstFailure` filter to Sequence.ts**

Open `src/plugins/core/Sequence.ts`. The current file looks like:

```ts
import { Plugin } from "../../core/Plugin";
import type { ValidationStatus } from "../../core/types";

export interface SequenceOptions {
  enabled?: boolean;
  [key: string]: unknown;
}

export class Sequence extends Plugin<SequenceOptions> {
  private previousResults = new Map<string, Record<string, ValidationStatus>>();

  constructor(opts?: SequenceOptions) {
    super({ enabled: true, ...opts });
  }

  private onValidatorValidated = (payload: unknown): void => {
    const { field, validator, result } = payload as {
      field: string;
      validator: string;
      result: { status: ValidationStatus };
    };
    if (!this.previousResults.has(field)) {
      this.previousResults.set(field, {});
    }
    const pr = this.previousResults.get(field);
    if (pr) pr[validator] = result.status;
  };

  private shouldValidate = (defaultValue: unknown, field: unknown, validator: unknown): boolean => {
    if (!this.opts.enabled) return defaultValue as boolean;

    const fieldName = field as string;
    const validatorName = validator as string;
    const fieldOpts = this.core.getFields()[fieldName];
    if (!fieldOpts) return defaultValue as boolean;

    const validatorNames = Object.keys(fieldOpts.validators);
    const currentIndex = validatorNames.indexOf(validatorName);
    if (currentIndex === 0) return defaultValue as boolean;

    const prevRun = this.previousResults.get(fieldName) ?? {};
    for (const prev of validatorNames.slice(0, currentIndex)) {
      const opts = fieldOpts.validators[prev];
      if (opts.enabled === false) continue;
      if (prevRun[prev] === "Invalid") return false;
    }

    return defaultValue as boolean;
  };

  install(): void {
    this.core.on("core.validator.validated", this.onValidatorValidated);
    this.core.registerFilter("field-should-validate", this.shouldValidate);
  }

  uninstall(): void {
    this.core.off("core.validator.validated", this.onValidatorValidated);
    this.core.deregisterFilter("field-should-validate", this.shouldValidate);
  }
}
```

Replace the entire file with:

```ts
import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload, ValidationStatus } from "../../core/types";

export interface SequenceOptions {
  enabled?: boolean;
  [key: string]: unknown;
}

export class Sequence extends Plugin<SequenceOptions> {
  private previousResults = new Map<string, Record<string, ValidationStatus>>();

  constructor(opts?: SequenceOptions) {
    super({ enabled: true, ...opts });
  }

  private onValidatorValidated = (payload: unknown): void => {
    const { field, validator, result } = payload as {
      field: string;
      validator: string;
      result: { status: ValidationStatus };
    };
    if (!this.previousResults.has(field)) {
      this.previousResults.set(field, {});
    }
    const pr = this.previousResults.get(field);
    if (pr) pr[validator] = result.status;
  };

  private shouldValidate = (defaultValue: unknown, field: unknown, validator: unknown): boolean => {
    if (!this.opts.enabled) return defaultValue as boolean;

    const fieldName = field as string;
    const validatorName = validator as string;
    const fieldOpts = this.core.getFields()[fieldName];
    if (!fieldOpts) return defaultValue as boolean;

    const validatorNames = Object.keys(fieldOpts.validators);
    const currentIndex = validatorNames.indexOf(validatorName);
    if (currentIndex === 0) return defaultValue as boolean;

    const prevRun = this.previousResults.get(fieldName) ?? {};
    for (const prev of validatorNames.slice(0, currentIndex)) {
      const opts = fieldOpts.validators[prev];
      if (opts.enabled === false) continue;
      if (prevRun[prev] === "Invalid") return false;
    }

    return defaultValue as boolean;
  };

  /** Post-validation filter: clear messages after the first failure (by definition order). */
  private trimToFirstFailure = (payload: unknown): unknown => {
    if (!this.opts.enabled) return payload;
    const p = payload as ElementValidatedPayload;
    if (p.valid) return payload;

    const fieldOpts = this.core.getFields()[p.field];
    if (!fieldOpts) return payload;

    const orderedNames = Object.keys(fieldOpts.validators);
    const firstFailedName = orderedNames.find(
      (name) => p.validators[name] && !p.validators[name].valid,
    );
    if (!firstFailedName) return payload;

    const trimmedValidators: ElementValidatedPayload["validators"] = {};
    for (const [name, result] of Object.entries(p.validators)) {
      trimmedValidators[name] =
        name === firstFailedName ? result : { ...result, message: "" };
    }
    return { ...p, validators: trimmedValidators };
  };

  install(): void {
    this.core.on("core.validator.validated", this.onValidatorValidated);
    this.core.registerFilter("field-should-validate", this.shouldValidate);
    this.core.registerFilter("element-validated", this.trimToFirstFailure);
  }

  uninstall(): void {
    this.core.off("core.validator.validated", this.onValidatorValidated);
    this.core.deregisterFilter("field-should-validate", this.shouldValidate);
    this.core.deregisterFilter("element-validated", this.trimToFirstFailure);
  }
}
```

- [ ] **Step 3: Add first-run test to Sequence.test.ts**

Open `tests/plugins/Sequence.test.ts`. Read the existing tests to understand what's there, then add this test to the existing `describe('Sequence', ...)` block:

```ts
it('shows only the first error on the very first validation run', async () => {
  const form = makeForm({ email: '' })
  const fv = validare(form, {
    plugins: { sequence: new Sequence() },
    fields: {
      email: {
        validators: {
          notEmpty: { message: 'Email is required' },
          email:    { message: 'Please enter a valid email address' },
        },
      },
    },
  })

  const messages: string[] = []
  fv.on('core.element.validated', (payload) => {
    const p = payload as import('../../src/core/types').ElementValidatedPayload
    for (const result of Object.values(p.validators)) {
      if (!result.valid && result.message) messages.push(result.message)
    }
  })

  await fv.validateField('email')

  // On the first run, only the first failing validator's message should be visible
  expect(messages).toHaveLength(1)
  expect(messages[0]).toBe('Email is required')
})
```

- [ ] **Step 4: Run Sequence tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/Sequence.test.ts
```

Expected: all existing tests pass + new test passes.

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all 711 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/core/Core.ts src/plugins/core/Sequence.ts tests/plugins/Sequence.test.ts
git commit -m "feat(sequence): add element-validated filter to show only first error per field"
```

---

## Task 2: Add `first` option to Message

**Files:**
- Modify: `src/plugins/core/Message.ts`
- Modify: `tests/plugins/Message.test.ts`

### Context

Current `Message.ts` renders all failing validators:
```ts
if (!valid) {
  for (const [, result] of Object.entries(validators)) {
    if (!result.valid && result.message) {
      const msg = document.createElement("div");
      msg.className = "fv-plugins-message";
      msg.textContent = result.message;
      container.appendChild(msg);
    }
  }
}
```

Adding `first?: boolean` to `MessageOptions` and slicing the entries to 1 when enabled.

---

- [ ] **Step 1: Update Message.ts**

In `src/plugins/core/Message.ts`, update `MessageOptions` to add `first`:

```ts
export interface MessageOptions {
  /** CSS selector for a custom message container. If omitted, a div is inserted after the field. */
  container?: string;
  /** CSS class added to the message container element */
  clazz?: string;
  /** When true, only the first error message is shown per field. Default: false. */
  first?: boolean;
  [key: string]: unknown;
}
```

Then update the `onElementValidated` handler. Find:
```ts
    container.innerHTML = "";
    if (!valid) {
      for (const [, result] of Object.entries(validators)) {
        if (!result.valid && result.message) {
          const msg = document.createElement("div");
          msg.className = "fv-plugins-message";
          msg.textContent = result.message;
          container.appendChild(msg);
        }
      }
    }
```

Replace with:
```ts
    container.innerHTML = "";
    if (!valid) {
      const failing = Object.values(validators).filter((r) => !r.valid && r.message);
      const toRender = this.opts.first ? failing.slice(0, 1) : failing;
      for (const result of toRender) {
        const msg = document.createElement("div");
        msg.className = "fv-plugins-message";
        msg.textContent = result.message;
        container.appendChild(msg);
      }
    }
```

- [ ] **Step 2: Add tests to Message.test.ts**

Read `tests/plugins/Message.test.ts` to understand the existing test structure. Add these tests to the existing describe block:

```ts
it('shows all error messages by default when multiple validators fail', async () => {
  const form = makeForm({ val: '' })
  const fv = validare(form, {
    plugins: { message: new Message() },
    fields: {
      val: {
        validators: {
          notEmpty: { message: 'Value is required' },
          email:    { message: 'Must be a valid email' },
        },
      },
    },
  })
  await fv.validateField('val')
  const container = form.querySelector('.fv-plugins-message-container')
  const msgs = container?.querySelectorAll('.fv-plugins-message')
  expect(msgs?.length).toBe(2)
})

it('shows only first error message when first: true', async () => {
  const form = makeForm({ val: '' })
  const fv = validare(form, {
    plugins: { message: new Message({ first: true }) },
    fields: {
      val: {
        validators: {
          notEmpty: { message: 'Value is required' },
          email:    { message: 'Must be a valid email' },
        },
      },
    },
  })
  await fv.validateField('val')
  const container = form.querySelector('.fv-plugins-message-container')
  const msgs = container?.querySelectorAll('.fv-plugins-message')
  expect(msgs?.length).toBe(1)
  expect(msgs?.[0].textContent).toBe('Value is required')
})
```

- [ ] **Step 3: Run Message tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/Message.test.ts
```

Expected: all existing tests pass + 2 new tests pass.

- [ ] **Step 4: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/core/Message.ts tests/plugins/Message.test.ts
git commit -m "feat(message): add first option to show only the first error per field"
```

---

## Task 3: Update CLAUDE.md + docs + rebuild UMD

**Files:**
- Modify: `CLAUDE.md`
- Modify: `validare-docs/plugins/Sequence.md`
- Modify: `validare-docs/plugins/Message.md`
- Run: `npm run build` + copy UMD

### Context

`CLAUDE.md` has a Plugin Filter System table that needs a new row for `element-validated`.

Current table:
```
| Filter name | Args | Used by |
|---|---|---|
| `validate-pre` | `(Promise<void>)` | SubmitButton — blocks during validation |
| `field-should-validate` | `(bool, field, validatorName, element)` | Sequence, Excluded |
| `field-value` | `(value, field, element, validatorName)` | Transformer — transforms value per validator |
```

`validare-docs/plugins/Sequence.md` has a playground example with two validators on email field. The Notes section currently doesn't mention the first-error behavior explicitly.

`validare-docs/plugins/Message.md` needs `first` added to the Options table.

---

- [ ] **Step 1: Update CLAUDE.md filter table**

In `CLAUDE.md`, find the Plugin Filter System table and add the new row:

```markdown
| `element-validated` | `(ElementValidatedPayload)` | Sequence — trims to first failure before rendering |
```

Full table after edit:
```markdown
| Filter name | Args | Used by |
|---|---|---|
| `validate-pre` | `(Promise<void>)` | SubmitButton — blocks during validation |
| `field-should-validate` | `(bool, field, validatorName, element)` | Sequence, Excluded |
| `field-value` | `(value, field, element, validatorName)` | Transformer — transforms value per validator |
| `element-validated` | `(ElementValidatedPayload)` | Sequence — trims to first failure before rendering |
```

- [ ] **Step 2: Update Sequence.md**

Read `validare-docs/plugins/Sequence.md`. In the `## Notes` section, add a bullet about the first-run fix:

Add at the end of the Notes section:
```markdown
- On the first validation run (before any previous results exist), the `element-validated` filter ensures only the first failing validator's message is shown.
```

- [ ] **Step 3: Update Message.md**

Read `validare-docs/plugins/Message.md`. Add `first` to the Options table:

```markdown
| `first` | `boolean` | `false` | When `true`, only the first error message is shown per field |
```

Also add a playground variant showing `first: true`. The existing playground shows `Message()`. Add a note in the Notes section:

```markdown
- Use `first: true` to show only the first error message per field (similar to Sequence, but at the display layer — all validators still run).
```

- [ ] **Step 4: Build and copy UMD**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm run build
cp dist/index.umd.js ../validare-docs/public/validare.umd.js
```

Expected: build succeeds, UMD copied.

- [ ] **Step 5: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add CLAUDE.md
git commit -m "docs(core): document element-validated filter in CLAUDE.md"

cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/Sequence.md plugins/Message.md
git commit -m "docs: update Sequence and Message pages for first-error behavior"
```

---

## Self-Review

**Spec coverage:**
- ✅ Option B: `element-validated` filter in Core + Sequence `trimToFirstFailure` — fixes first-run multiple messages
- ✅ Option A: `Message({ first: true })` — display-layer first-error control
- ✅ Tests for both
- ✅ CLAUDE.md updated with new filter
- ✅ Docs updated for Sequence and Message

**Type consistency:**
- `ElementValidatedPayload` is already imported in Core.ts — the new filter call uses the same type ✅
- `trimToFirstFailure` imports `ElementValidatedPayload` from `../../core/types` ✅
- `Message.opts.first` is `boolean | undefined` — `this.opts.first ? ... : ...` handles both correctly ✅

**Placeholder scan:** None found.
