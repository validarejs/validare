# FieldStatus Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `FieldStatus` plugin that tracks per-field validation status and fires a callback whenever the overall form validity changes.

**Architecture:** The plugin maintains a `Map<field, FieldValidationStatus>` and listens to `core.field.added`, `core.field.removed`, `core.field.validating`, `core.field.validated`, and `core.form.reset`. It exposes `getStatuses()` and `areFieldsValid()` methods, and calls `opts.onStatusChanged(boolean)` after every status change. Goes in **Core Plugins** section.

**Tech Stack:** TypeScript, Vitest, JSDOM, existing validare plugin pattern.

---

## File Map

```
src/plugins/core/FieldStatus.ts        ← new plugin
src/plugins/index.ts                   ← add export (after DefaultSubmit)
tests/plugins/FieldStatus.test.ts      ← new test file
validare-docs/plugins/FieldStatus.md   ← new VitePress page
validare-docs/plugins/index.md         ← add to Core Plugins table
validare-docs/.vitepress/config.ts     ← Core Plugins (10) → (11)
validare-docs/public/validare.umd.js   ← rebuild UMD
docs/superpowers/BACKLOG.md            ← mark FieldStatus as ✅
```

---

## Task 1: Implement FieldStatus plugin + tests

**Files:**
- Create: `src/plugins/core/FieldStatus.ts`
- Modify: `src/plugins/index.ts`
- Create: `tests/plugins/FieldStatus.test.ts`

### Context

**Events used (all exist in Validare Core):**

| Event | Payload | When |
|---|---|---|
| `core.field.added` | `{ field: string; elements: HTMLElement[]; options: FieldOptions }` | `addField()` called |
| `core.field.removed` | `{ field: string; elements: HTMLElement[]; options: FieldOptions }` | `removeField()` called |
| `core.field.validating` | `{ field: string }` | Before field validators run |
| `core.field.validated` | `{ field: string; result: ValidationStatus; elements: HTMLElement[] }` | After all element validators for a field finish |
| `core.form.reset` | `{ instance: Core }` | After `fv.reset()` |

**Types:**
- `ValidationStatus = "Valid" | "Invalid" | "NotValidated"` — imported from `../../core/types`
- `FieldValidationStatus = ValidationStatus | "Validating"` — defined in the plugin

**Plugin base class:** `this.core`, `this.opts`, `this.isEnabled()`, `install()`, `uninstall()`.
Constructor must call `this.disable()` if `opts?.enabled === false`.
Options interface needs `[key: string]: unknown` index signature (required by `Plugin<T extends Record<string, unknown>>`).

**areFieldsValid() logic:** Returns `true` when every field status is `"Valid"` or `"NotValidated"`. Returns `false` if any is `"Invalid"` or `"Validating"`.

**getStatuses() logic:** Returns the internal `Map` when enabled, returns `new Map()` when disabled.

**onStatusChanged:** Optional callback; always call via `this.opts.onStatusChanged?.(areFieldsValid)`. Only invoke when `this.isEnabled()`.

**Import path:**
```ts
import { Plugin } from "../../core/Plugin";
import type { ValidationStatus } from "../../core/types";
```

**Test helpers:** `import { makeForm } from "../helpers"` — creates named inputs appended to `document.body`.

**Plugin instance pattern:** Keep a reference to the plugin instance to access `getStatuses()` and `areFieldsValid()` in tests:
```ts
const plugin = new FieldStatus();
const fv = validare(form, { plugins: { fieldStatus: plugin }, fields: { ... } });
plugin.getStatuses().get("name"); // works because plugin is already installed
```

**Run tests:** `cd /Users/varantes/workspace/sandbox/jvalidation/validare && npm test -- tests/plugins/FieldStatus.test.ts`

---

- [ ] **Step 1: Create `src/plugins/core/FieldStatus.ts`**

```ts
import { Plugin } from "../../core/Plugin";
import type { ValidationStatus } from "../../core/types";

export type FieldValidationStatus = ValidationStatus | "Validating";

export interface FieldStatusOptions {
  onStatusChanged?: (areFieldsValid: boolean) => void;
  [key: string]: unknown;
}

export class FieldStatus extends Plugin<FieldStatusOptions> {
  private statuses = new Map<string, FieldValidationStatus>();

  constructor(opts?: FieldStatusOptions) {
    super(opts);
    if (opts?.enabled === false) this.disable();
  }

  private onFieldAdded = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.statuses.set(field, "NotValidated");
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.statuses.delete(field);
    this.notifyStatusChanged();
  };

  private onFieldValidating = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.statuses.set(field, "Validating");
    this.notifyStatusChanged();
  };

  private onFieldValidated = (payload: unknown): void => {
    const { field, result } = payload as { field: string; result: ValidationStatus };
    this.statuses.set(field, result);
    this.notifyStatusChanged();
  };

  private onFormReset = (): void => {
    for (const field of this.statuses.keys()) {
      this.statuses.set(field, "NotValidated");
    }
    this.notifyStatusChanged();
  };

  private notifyStatusChanged(): void {
    if (!this.isEnabled()) return;
    this.opts.onStatusChanged?.(this.areFieldsValid());
  }

  areFieldsValid(): boolean {
    return Array.from(this.statuses.values()).every(
      (s) => s === "Valid" || s === "NotValidated",
    );
  }

  getStatuses(): Map<string, FieldValidationStatus> {
    return this.isEnabled() ? this.statuses : new Map();
  }

  install(): void {
    this.core.on("core.field.added", this.onFieldAdded);
    this.core.on("core.field.removed", this.onFieldRemoved);
    this.core.on("core.field.validating", this.onFieldValidating);
    this.core.on("core.field.validated", this.onFieldValidated);
    this.core.on("core.form.reset", this.onFormReset);
  }

  uninstall(): void {
    this.core.off("core.field.added", this.onFieldAdded);
    this.core.off("core.field.removed", this.onFieldRemoved);
    this.core.off("core.field.validating", this.onFieldValidating);
    this.core.off("core.field.validated", this.onFieldValidated);
    this.core.off("core.form.reset", this.onFormReset);
    this.statuses.clear();
  }
}
```

- [ ] **Step 2: Add export to `src/plugins/index.ts`**

Read the file. Find the DefaultSubmit export lines. Add after them:

```ts
export { FieldStatus } from "./core/FieldStatus";
export type { FieldStatusOptions, FieldValidationStatus } from "./core/FieldStatus";
```

- [ ] **Step 3: Create `tests/plugins/FieldStatus.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { validare } from "../../src";
import { FieldStatus } from "../../src/plugins/core/FieldStatus";
import { makeForm } from "../helpers";

describe("FieldStatus", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("initializes field status as NotValidated when field is added", () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    expect(plugin.getStatuses().get("name")).toBe("NotValidated");
  });

  it("tracks field status as Valid after successful validation", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.getStatuses().get("name")).toBe("Valid");
  });

  it("tracks field status as Invalid after failed validation", async () => {
    const form = makeForm({ name: "" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.getStatuses().get("name")).toBe("Invalid");
  });

  it("sets status to Validating during async validation, then Valid on resolve", async () => {
    let resolveCallback!: (r: { valid: boolean }) => void;
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: {
        name: {
          validators: {
            callback: {
              message: "Invalid",
              callback: () =>
                new Promise<{ valid: boolean }>((r) => {
                  resolveCallback = r;
                }),
            },
          },
        },
      },
    });
    // core.field.validating fires synchronously before the async callback runs
    const p = fv.validate();
    expect(plugin.getStatuses().get("name")).toBe("Validating");
    resolveCallback({ valid: true });
    await p;
    expect(plugin.getStatuses().get("name")).toBe("Valid");
  });

  it("areFieldsValid() returns true when all fields are NotValidated", () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    expect(plugin.areFieldsValid()).toBe(true);
  });

  it("areFieldsValid() returns false when a field is Invalid", async () => {
    const form = makeForm({ name: "" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.areFieldsValid()).toBe(false);
  });

  it("areFieldsValid() returns true when all fields are Valid", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.areFieldsValid()).toBe(true);
  });

  it("calls onStatusChanged(false) when a field becomes invalid", async () => {
    const onStatusChanged = vi.fn();
    const form = makeForm({ name: "" });
    const fv = validare(form, {
      plugins: { fieldStatus: new FieldStatus({ onStatusChanged }) },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(onStatusChanged).toHaveBeenLastCalledWith(false);
  });

  it("calls onStatusChanged(true) when all fields are valid", async () => {
    const onStatusChanged = vi.fn();
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { fieldStatus: new FieldStatus({ onStatusChanged }) },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(onStatusChanged).toHaveBeenLastCalledWith(true);
  });

  it("resets all field statuses to NotValidated after fv.reset()", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.getStatuses().get("name")).toBe("Valid");
    fv.reset();
    expect(plugin.getStatuses().get("name")).toBe("NotValidated");
  });

  it("removes field from statuses when field is removed", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    fv.removeField("name");
    expect(plugin.getStatuses().has("name")).toBe(false);
  });

  it("getStatuses() returns empty map when disabled", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus({ enabled: false });
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.getStatuses().size).toBe(0);
  });

  it("does not call onStatusChanged when disabled", async () => {
    const onStatusChanged = vi.fn();
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { fieldStatus: new FieldStatus({ enabled: false, onStatusChanged }) },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(onStatusChanged).not.toHaveBeenCalled();
  });

  it("stops tracking after uninstall", async () => {
    const form = makeForm({ name: "" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    fv.deregisterPlugin("fieldStatus");
    await fv.validate();
    // statuses cleared on uninstall, plugin no longer receives events
    expect(plugin.getStatuses().size).toBe(0);
  });
});
```

- [ ] **Step 4: Run FieldStatus tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/FieldStatus.test.ts
```

Expected: all 13 tests pass. If any fail, fix the implementation.

- [ ] **Step 5: Run full test suite**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add src/plugins/core/FieldStatus.ts src/plugins/index.ts tests/plugins/FieldStatus.test.ts
git commit -m "feat(field-status): add FieldStatus plugin for per-field validation status tracking"
```

---

## Task 2: VitePress docs + rebuild UMD + update backlog

**Files:**
- Create: `validare-docs/plugins/FieldStatus.md`
- Modify: `validare-docs/plugins/index.md` (Core Plugins table)
- Modify: `validare-docs/.vitepress/config.ts` (Core Plugins 10→11)
- Modify: `validare-docs/public/validare.umd.js` (rebuild)
- Modify: `docs/superpowers/BACKLOG.md`

### Context

**VitePress reference:** Read `validare-docs/plugins/DefaultSubmit.md` as structural reference.
**Sidebar:** find `"Core Plugins (10)"`, change to `"Core Plugins (11)"`, add `{ text: 'FieldStatus', link: '/plugins/FieldStatus' }` after DefaultSubmit.
**UMD copy:** use `command cp` (not `cp`).

---

- [ ] **Step 1: Create `validare-docs/plugins/FieldStatus.md`**

```md
# `FieldStatus` Plugin

Tracks the validation status of each field in real time and fires a callback whenever the form's overall validity changes — useful for enabling or disabling a submit button as the user fills the form.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enable or disable the plugin |
| `onStatusChanged` | `(areFieldsValid: boolean) => void` | `undefined` | Called after any field status change |

## Public Methods

| Method | Returns | Description |
| --- | --- | --- |
| `getStatuses()` | `Map<string, FieldValidationStatus>` | Returns the current status of every field. Returns an empty map when the plugin is disabled. |
| `areFieldsValid()` | `boolean` | Returns `true` when all fields are `"Valid"` or `"NotValidated"`. Returns `false` if any field is `"Invalid"` or `"Validating"`. |

## Field Status Values

| Value | Meaning |
| --- | --- |
| `"NotValidated"` | Field has not been validated yet (initial state) |
| `"Validating"` | Async validators are running |
| `"Valid"` | All validators passed |
| `"Invalid"` | At least one validator failed |

## Playground

Fill in the fields and watch the submit button enable automatically when all fields are valid.

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
    <button type="submit" id="submit" disabled>Submit</button>
  </form>
\`;
const { validare, Message, Trigger, FieldStatus } = Validare;

const submitBtn = document.getElementById('submit');

const fv = validare(document.getElementById('demo'), {
  fields: {
    name:  { validators: { notEmpty: { message: 'Name is required' } } },
    email: { validators: { notEmpty: { message: 'Email is required' },
                           email:    { message: 'Enter a valid email' } } },
  },
  plugins: {
    message: new Message(),
    trigger: new Trigger(),
    fieldStatus: new FieldStatus({
      onStatusChanged: (areFieldsValid) => {
        submitBtn.disabled = !areFieldsValid;
      },
    }),
  },
});
`.trim()
</script>

<ValidarePlayground :code="code" />

## Notes

- `areFieldsValid()` returns `true` when all fields are `"NotValidated"` (initial state) — this means the submit button starts enabled by default. If you want it disabled until the user attempts submission, initialise the button as disabled and only enable it after the first validation.
- `onStatusChanged` is called multiple times during validation (once when validation starts, once when it finishes). Always use the latest value.
- Access `getStatuses()` to build per-field UI indicators (e.g., coloured dots in a multi-step progress bar).
```

- [ ] **Step 2: Add FieldStatus to `validare-docs/plugins/index.md`**

Read the file. Find the Core Plugins table. Add after the DefaultSubmit row:

```markdown
| [FieldStatus](./FieldStatus.md) | Tracks per-field validation status and fires a callback on change |
```

- [ ] **Step 3: Update `validare-docs/.vitepress/config.ts` sidebar**

Find `"Core Plugins (10)"`. Change to `"Core Plugins (11)"`. Add `{ text: 'FieldStatus', link: '/plugins/FieldStatus' }` after the DefaultSubmit entry.

- [ ] **Step 4: Build and copy UMD**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm run build
command cp dist/index.umd.js ../validare-docs/public/validare.umd.js
```

- [ ] **Step 5: Update BACKLOG.md**

In `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/superpowers/BACKLOG.md`, change:
```
| ⬜ Pendente | **FieldStatus** | Emite eventos granulares de mudança de status por campo |
```
To:
```
| ✅ Concluído | **FieldStatus** | Emite eventos granulares de mudança de status por campo |
```

- [ ] **Step 6: Commit validare**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add docs/superpowers/BACKLOG.md
git commit -m "docs: mark FieldStatus as completed in backlog"
```

- [ ] **Step 7: Commit validare-docs**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/FieldStatus.md plugins/index.md .vitepress/config.ts public/validare.umd.js
git commit -m "docs: add FieldStatus plugin page, update sidebar to Core Plugins (11)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Tracks per-field status: `NotValidated → Validating → Valid/Invalid`
- ✅ `areFieldsValid()` public method
- ✅ `getStatuses()` public method
- ✅ `onStatusChanged` callback fires after every status change
- ✅ Respects `isEnabled()` guard in `notifyStatusChanged()` and `getStatuses()`
- ✅ `enabled: false` handled in constructor
- ✅ Cleanup (`statuses.clear()`) on `uninstall()`
- ✅ 13 tests covering all behaviors
- ✅ VitePress page with playground (submit button enable/disable)
- ✅ BACKLOG.md updated

**Placeholder scan:** None found.

**Type consistency:** `FieldValidationStatus = ValidationStatus | "Validating"`. `onFieldValidated` sets `result` (type `ValidationStatus`) directly — this is a subset of `FieldValidationStatus`, assignment is valid. `getStatuses()` return type matches the internal map type. All method names consistent across plan.
