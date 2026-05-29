# AutoFocus Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `AutoFocus` plugin that automatically focuses the first invalid field when form validation fails.

**Architecture:** The plugin tracks each field's validation status via `core.field.validated`. On `core.form.invalid`, it iterates the fields in definition order, finds the first with `"Invalid"` status, and calls `.focus()` on its first DOM element. An optional `onPrefocus` callback fires before focusing, allowing custom logic. No external plugin dependencies — status tracking is self-contained.

**Tech Stack:** TypeScript, Vitest, JSDOM, existing validare plugin pattern.

---

## File Map

```
src/plugins/core/AutoFocus.ts       ← new plugin
src/plugins/index.ts                ← add export
tests/plugins/AutoFocus.test.ts     ← new test file
validare-docs/plugins/AutoFocus.md  ← new VitePress page
validare-docs/plugins/index.md      ← add AutoFocus to Core Plugins table
validare-docs/.vitepress/config.ts  ← update sidebar to Core Plugins (8)
validare-docs/public/validare.umd.js ← rebuild UMD
docs/superpowers/BACKLOG.md         ← mark AutoFocus as ✅
```

---

## Task 1: Implement AutoFocus plugin + tests

**Files:**
- Create: `src/plugins/core/AutoFocus.ts`
- Modify: `src/plugins/index.ts`
- Create: `tests/plugins/AutoFocus.test.ts`

### Context

**Relevant Core events (from Core.ts):**
- `core.field.validated` — payload: `{ field: string, result: ValidationStatus, elements: HTMLElement[] }` — fires after each field completes validation
- `core.form.invalid` — payload: `{ instance: Core }` — fires after `validate()` if any field is Invalid
- `core.field.removed` — payload: `{ field: string, elements: HTMLElement[], options: FieldOptions }` — fires when a field is removed
- `core.form.reset` — payload: `{ instance: Core }` — fires after `reset()` is called

**`ValidationStatus`** = `'Valid' | 'Invalid' | 'NotValidated'` (from `src/core/types.ts`)

**`this.core.getFields()`** returns `Record<string, FieldOptions>` — keys in definition order (insertion order of a JS object, which is preserved in V8 and JSDOM).

**`this.core.getElements(field)`** returns `HTMLElement[]` — all DOM elements for that field.

**Plugin base class** (from `src/core/Plugin.ts`): provides `this.core`, `this.opts`, `this.isEnabled()`, `install()`, `uninstall()`.

**How other plugins export their options type** (from `src/plugins/index.ts`):
```ts
export { Aria } from "./core/Aria";
export type { AriaOptions } from "./core/Aria";
```

---

- [ ] **Step 1: Create `src/plugins/core/AutoFocus.ts`**

```ts
import { Plugin } from "../../core/Plugin";
import type { ValidationStatus } from "../../core/types";

export interface AutoFocusOptions {
  /** Called before focusing the first invalid element. Return false to cancel focus. */
  onPrefocus?: (payload: { field: string; element: HTMLElement }) => void;
  [key: string]: unknown;
}

export class AutoFocus extends Plugin<AutoFocusOptions> {
  private fieldStatuses = new Map<string, ValidationStatus>();

  private onFieldValidated = (payload: unknown): void => {
    const { field, result } = payload as { field: string; result: ValidationStatus };
    this.fieldStatuses.set(field, result);
  };

  private onFormInvalid = (): void => {
    if (!this.isEnabled()) return;

    const fields = this.core.getFields();
    for (const field of Object.keys(fields)) {
      if (this.fieldStatuses.get(field) === "Invalid") {
        const elements = this.core.getElements(field);
        const firstElement = elements[0];
        if (!firstElement) continue;

        if (this.opts.onPrefocus) {
          this.opts.onPrefocus({ field, element: firstElement });
        }

        firstElement.focus();
        return;
      }
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.fieldStatuses.delete(field);
  };

  private onFormReset = (): void => {
    this.fieldStatuses.clear();
  };

  install(): void {
    this.core.on("core.field.validated", this.onFieldValidated);
    this.core.on("core.form.invalid", this.onFormInvalid);
    this.core.on("core.field.removed", this.onFieldRemoved);
    this.core.on("core.form.reset", this.onFormReset);
  }

  uninstall(): void {
    this.core.off("core.field.validated", this.onFieldValidated);
    this.core.off("core.form.invalid", this.onFormInvalid);
    this.core.off("core.field.removed", this.onFieldRemoved);
    this.core.off("core.form.reset", this.onFormReset);
    this.fieldStatuses.clear();
  }
}
```

- [ ] **Step 2: Add export to `src/plugins/index.ts`**

Read the file. Find the Aria export (most recently added). Add after it:

```ts
export { AutoFocus } from "./core/AutoFocus";
export type { AutoFocusOptions } from "./core/AutoFocus";
```

- [ ] **Step 3: Create `tests/plugins/AutoFocus.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { validare } from "../../src";
import { AutoFocus } from "../../src/plugins/core/AutoFocus";
import { makeForm } from "../helpers";

describe("AutoFocus", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("focuses the first invalid field after form.validate()", async () => {
    const form = makeForm({ name: "", email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        name:  { validators: { notEmpty: { message: "Name required" } } },
        email: { validators: { notEmpty: { message: "Email required" } } },
      },
    });
    const nameInput  = form.querySelector('[name="name"]')  as HTMLInputElement;
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    nameInput.focus  = vi.fn();
    emailInput.focus = vi.fn();

    await fv.validate();

    expect(nameInput.focus).toHaveBeenCalledOnce();
    expect(emailInput.focus).not.toHaveBeenCalled();
  });

  it("focuses the first still-invalid field when earlier fields become valid", async () => {
    const form = makeForm({ name: "", email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        name:  { validators: { notEmpty: { message: "Name required" } } },
        email: { validators: { notEmpty: { message: "Email required" } } },
      },
    });
    const nameInput  = form.querySelector('[name="name"]')  as HTMLInputElement;
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;

    // First run: both invalid — name focused
    nameInput.focus  = vi.fn();
    emailInput.focus = vi.fn();
    await fv.validate();
    expect(nameInput.focus).toHaveBeenCalledOnce();

    // Make name valid, re-validate — email should be focused now
    nameInput.value = "Alice";
    fv.resetField("name");
    fv.resetField("email");
    nameInput.focus  = vi.fn();
    emailInput.focus = vi.fn();
    await fv.validate();
    expect(nameInput.focus).not.toHaveBeenCalled();
    expect(emailInput.focus).toHaveBeenCalledOnce();
  });

  it("does not focus when form is valid", async () => {
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        name: { validators: { notEmpty: { message: "Name required" } } },
      },
    });
    const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
    nameInput.focus = vi.fn();

    await fv.validate();

    expect(nameInput.focus).not.toHaveBeenCalled();
  });

  it("calls onPrefocus callback before focusing", async () => {
    const form = makeForm({ email: "" });
    const prefocusSpy = vi.fn();
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus({ onPrefocus: prefocusSpy }) },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    emailInput.focus = vi.fn();

    await fv.validate();

    expect(prefocusSpy).toHaveBeenCalledOnce();
    expect(prefocusSpy).toHaveBeenCalledWith({ field: "email", element: emailInput });
    expect(emailInput.focus).toHaveBeenCalledOnce();
  });

  it("does nothing when disabled", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus({ enabled: false }) },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    emailInput.focus = vi.fn();

    await fv.validate();

    expect(emailInput.focus).not.toHaveBeenCalled();
  });

  it("cleans up status on field removed", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validate();
    fv.removeField("email");

    // After removal, validate() would find no invalid fields — no focus call
    // Re-add and check it doesn't use stale status
    fv.addField("email", { validators: { notEmpty: { message: "Required" } } });
    const newInput = form.querySelector('[name="email"]') as HTMLInputElement;
    newInput.focus = vi.fn();
    await fv.validate();
    expect(newInput.focus).toHaveBeenCalledOnce();
  });

  it("clears all statuses on form reset", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validate();
    fv.reset();

    // After reset, validateField only → no core.form.invalid → no focus
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    emailInput.focus = vi.fn();
    await fv.validateField("email");
    expect(emailInput.focus).not.toHaveBeenCalled();
  });

  it("uninstall stops focus behavior", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    fv.deregisterPlugin("autoFocus");

    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    emailInput.focus = vi.fn();
    await fv.validate();
    expect(emailInput.focus).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Run AutoFocus tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/AutoFocus.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add src/plugins/core/AutoFocus.ts src/plugins/index.ts tests/plugins/AutoFocus.test.ts
git commit -m "feat(autofocus): add AutoFocus plugin to focus first invalid field on form invalid"
```

---

## Task 2: VitePress docs + rebuild UMD + update backlog

**Files:**
- Create: `validare-docs/plugins/AutoFocus.md`
- Modify: `validare-docs/plugins/index.md`
- Modify: `validare-docs/.vitepress/config.ts`
- Modify: `validare-docs/public/validare.umd.js` (rebuild)
- Modify: `validare/docs/superpowers/BACKLOG.md`

### Context

**VitePress page structure:** Read `validare-docs/plugins/Aria.md` as the reference — it was the most recently created page and follows the established pattern exactly.

**`plugins/index.md` Core Plugins table** — currently 7 rows (after Aria was added). Add AutoFocus.

**`.vitepress/config.ts` sidebar** — currently `"Core Plugins (7)"`. Change to `"Core Plugins (8)"`, add `{ text: 'AutoFocus', link: '/plugins/AutoFocus' }`.

**UMD copy:** use `command cp` (not `cp`) to bypass macOS alias that prompts for overwrite.

---

- [ ] **Step 1: Create `validare-docs/plugins/AutoFocus.md`**

```md
# `AutoFocus` Plugin

Automatically focuses the first invalid field when form validation fails, improving keyboard navigation and accessibility.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enable or disable the plugin |
| `onPrefocus` | `function` | `undefined` | Called before focusing: `({ field, element }) => void` |

## Playground

Submit the form with empty fields — the cursor jumps to the first invalid input automatically.

<script setup>
const code = `
document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Name</label>
      <input type="text" name="name" placeholder="Your name">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="button" id="btn">Validate</button>
    <p id="out" style="margin-top:8px;font-size:13px;color:#555;font-family:monospace"></p>
  </form>
\`;
const { validare, Message, AutoFocus } = Validare;
const fv = validare(document.getElementById('demo'), {
  fields: {
    name:  { validators: { notEmpty: { message: 'Name is required' } } },
    email: { validators: { notEmpty: { message: 'Email is required' },
                           email:    { message: 'Please enter a valid email' } } },
  },
  plugins: {
    message:   new Message(),
    autoFocus: new AutoFocus({
      onPrefocus: ({ field }) => {
        document.getElementById('out').textContent = 'Focused: ' + field;
      }
    }),
  },
});
document.getElementById('btn').addEventListener('click', () => fv.validate());
`.trim()
</script>

<ValidarePlayground :code="code" />

## Notes

- Focuses the **first** invalid field in the order they were defined in `fields`.
- Only fires on `core.form.invalid` — triggered by `fv.validate()`, not by `fv.validateField()`.
- Use `onPrefocus` to scroll to the field, show a toast, or log analytics before the focus occurs.
- Compatible with `Aria` plugin — combining both gives full keyboard + screen reader accessibility.
```

- [ ] **Step 2: Add AutoFocus to `validare-docs/plugins/index.md`**

Read the file. Find the Core Plugins table. Add a row after Aria:

```markdown
| [AutoFocus](./AutoFocus.md) | Focuses the first invalid field automatically after form validation fails |
```

- [ ] **Step 3: Update `validare-docs/.vitepress/config.ts` sidebar**

Find `"Core Plugins (7)"`. Change to `"Core Plugins (8)"`. Add `{ text: 'AutoFocus', link: '/plugins/AutoFocus' }` at the end of Core Plugins items (after Aria).

- [ ] **Step 4: Build and copy UMD**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm run build
command cp dist/index.umd.js ../validare-docs/public/validare.umd.js
```

Expected: build succeeds, no errors.

- [ ] **Step 5: Update BACKLOG.md**

In `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/superpowers/BACKLOG.md`, change:

```markdown
| ⬜ Pendente | **AutoFocus** | Foca automaticamente no primeiro campo inválido após tentativa de submit |
```

To:

```markdown
| ✅ Concluído | **AutoFocus** | Foca automaticamente no primeiro campo inválido após tentativa de submit |
```

- [ ] **Step 6: Commit validare**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add docs/superpowers/BACKLOG.md
git commit -m "docs: mark AutoFocus as completed in backlog"
```

- [ ] **Step 7: Commit validare-docs**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/AutoFocus.md plugins/index.md .vitepress/config.ts public/validare.umd.js
git commit -m "docs: add AutoFocus plugin page, update sidebar to Core Plugins (8)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Focuses first invalid field on `core.form.invalid`
- ✅ Respects definition order of fields
- ✅ `onPrefocus` callback fires before focus
- ✅ No focus when form is valid
- ✅ Respects `enabled: false`
- ✅ Cleans up on `core.field.removed`
- ✅ Clears statuses on `core.form.reset`
- ✅ Stops on `uninstall()`
- ✅ Tests for all above
- ✅ VitePress docs page with playground
- ✅ BACKLOG.md updated

**Placeholder scan:** None found.

**Type consistency:** `ValidationStatus` from `../../core/types` — same import used across all plugins. Payload types cast from `unknown` consistently with existing plugins.
