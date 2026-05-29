# DefaultSubmit Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `DefaultSubmit` plugin that automatically calls `form.submit()` when all fields are valid after `fv.validate()`.

**Architecture:** The plugin listens to `core.form.valid` and calls `this.core.form.submit()`. It warns on install if the form has a submit button with `name="submit"` (which would shadow the native `form.submit` method). No options beyond `enabled`. Goes in **Core Plugins** section.

**Tech Stack:** TypeScript, Vitest, JSDOM, existing validare plugin pattern.

---

## File Map

```
src/plugins/core/DefaultSubmit.ts        ← new plugin
src/plugins/index.ts                     ← add export (after Tooltip)
tests/plugins/DefaultSubmit.test.ts      ← new test file
validare-docs/plugins/DefaultSubmit.md   ← new VitePress page
validare-docs/plugins/index.md           ← add to Core Plugins table
validare-docs/.vitepress/config.ts       ← Core Plugins (9) → (10)
validare-docs/public/validare.umd.js     ← rebuild UMD
docs/superpowers/BACKLOG.md              ← mark DefaultSubmit as ✅
```

---

## Task 1: Implement DefaultSubmit plugin + tests

**Files:**
- Create: `src/plugins/core/DefaultSubmit.ts`
- Modify: `src/plugins/index.ts`
- Create: `tests/plugins/DefaultSubmit.test.ts`

### Context

**Core:**
- `this.core.form` — the `HTMLFormElement` (public readonly property)
- `core.form.valid` event — fires after `validate()` if all fields are Valid; payload: `{ instance: Core }`

**Plugin base class:** `this.core`, `this.opts`, `this.isEnabled()`, `install()`, `uninstall()`.
Does NOT handle `enabled: false` automatically — constructor must call `this.disable()` if `opts?.enabled === false`.

**Safety check:** A submit button with `name="submit"` shadows the native `form.submit` method, making `form.submit()` throw. Throw an error in `install()` if this is detected.

**Import path:**
```ts
import { Plugin } from "../../core/Plugin";
```

**Test helpers:** `import { makeForm } from "../helpers"` — creates named inputs appended to `document.body`.

**Run tests:** `cd /Users/varantes/workspace/sandbox/jvalidation/validare && npm test -- tests/plugins/DefaultSubmit.test.ts`

---

- [ ] **Step 1: Create `src/plugins/core/DefaultSubmit.ts`**

```ts
import { Plugin } from "../../core/Plugin";

export interface DefaultSubmitOptions {
  [key: string]: unknown;
}

export class DefaultSubmit extends Plugin<DefaultSubmitOptions> {
  constructor(opts?: DefaultSubmitOptions) {
    super({ ...opts });
    if (opts?.enabled === false) this.disable();
  }

  private onFormValid = (): void => {
    if (!this.isEnabled()) return;
    this.core.form.submit();
  };

  install(): void {
    if (this.core.form.querySelectorAll('[type="submit"][name="submit"]').length > 0) {
      throw new Error(
        'DefaultSubmit: do not use "submit" as the name of a submit button — it shadows form.submit()',
      );
    }
    this.core.on("core.form.valid", this.onFormValid);
  }

  uninstall(): void {
    this.core.off("core.form.valid", this.onFormValid);
  }
}
```

- [ ] **Step 2: Add export to `src/plugins/index.ts`**

Read the file. Find the Tooltip export lines. Add after them:

```ts
export { DefaultSubmit } from "./core/DefaultSubmit";
export type { DefaultSubmitOptions } from "./core/DefaultSubmit";
```

- [ ] **Step 3: Create `tests/plugins/DefaultSubmit.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { validare } from "../../src";
import { DefaultSubmit } from "../../src/plugins/core/DefaultSubmit";
import { makeForm } from "../helpers";

describe("DefaultSubmit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("calls form.submit() when all fields are valid", async () => {
    const form = makeForm({ name: "Alice" });
    form.submit = vi.fn();
    const fv = validare(form, {
      plugins: { defaultSubmit: new DefaultSubmit() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(form.submit).toHaveBeenCalledOnce();
  });

  it("does not call form.submit() when a field is invalid", async () => {
    const form = makeForm({ name: "" });
    form.submit = vi.fn();
    const fv = validare(form, {
      plugins: { defaultSubmit: new DefaultSubmit() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(form.submit).not.toHaveBeenCalled();
  });

  it("does not call form.submit() when disabled", async () => {
    const form = makeForm({ name: "Alice" });
    form.submit = vi.fn();
    const fv = validare(form, {
      plugins: { defaultSubmit: new DefaultSubmit({ enabled: false }) },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(form.submit).not.toHaveBeenCalled();
  });

  it("does not call form.submit() after uninstall", async () => {
    const form = makeForm({ name: "Alice" });
    form.submit = vi.fn();
    const fv = validare(form, {
      plugins: { defaultSubmit: new DefaultSubmit() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    fv.deregisterPlugin("defaultSubmit");
    await fv.validate();
    expect(form.submit).not.toHaveBeenCalled();
  });

  it("throws on install if a submit button has name=\"submit\"", () => {
    const form = makeForm({ name: "Alice" });
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.name = "submit";
    form.appendChild(btn);

    expect(() => {
      validare(form, {
        plugins: { defaultSubmit: new DefaultSubmit() },
        fields: { name: { validators: {} } },
      });
    }).toThrow('do not use "submit" as the name of a submit button');
  });
});
```

- [ ] **Step 4: Run DefaultSubmit tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/DefaultSubmit.test.ts
```

Expected: all 5 tests pass. If any fail, fix the implementation.

- [ ] **Step 5: Run full test suite**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add src/plugins/core/DefaultSubmit.ts src/plugins/index.ts tests/plugins/DefaultSubmit.test.ts
git commit -m "feat(default-submit): add DefaultSubmit plugin to auto-submit on form valid"
```

---

## Task 2: VitePress docs + rebuild UMD + update backlog

**Files:**
- Create: `validare-docs/plugins/DefaultSubmit.md`
- Modify: `validare-docs/plugins/index.md` (Core Plugins table)
- Modify: `validare-docs/.vitepress/config.ts` (Core Plugins 9→10)
- Modify: `validare-docs/public/validare.umd.js` (rebuild)
- Modify: `docs/superpowers/BACKLOG.md`

### Context

**VitePress reference:** Read `validare-docs/plugins/AutoFocus.md` as structural reference.
**Sidebar:** find `"Core Plugins (9)"`, change to `"Core Plugins (10)"`, add `{ text: 'DefaultSubmit', link: '/plugins/DefaultSubmit' }` after Tooltip.
**UMD copy:** use `command cp` (not `cp`).

---

- [ ] **Step 1: Create `validare-docs/plugins/DefaultSubmit.md`**

```md
# `DefaultSubmit` Plugin

Automatically submits the form when all fields pass validation — no manual submit handler needed.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enable or disable the plugin |

## Playground

Fill in both fields and click Validate. When all fields are valid, the form submits automatically (intercepted here to show a confirmation message).

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
    <p id="out" style="margin-top:8px;font-size:13px;color:#16a34a;font-weight:600"></p>
  </form>
\`;
const { validare, Message, DefaultSubmit } = Validare;

// Intercept form.submit so the playground doesn't navigate
const form = document.getElementById('demo');
form.submit = () => {
  document.getElementById('out').textContent = '✓ Form submitted!';
};

const fv = validare(form, {
  fields: {
    name:  { validators: { notEmpty: { message: 'Name is required' } } },
    email: { validators: { notEmpty: { message: 'Email is required' },
                           email:    { message: 'Enter a valid email' } } },
  },
  plugins: {
    message:       new Message(),
    defaultSubmit: new DefaultSubmit(),
  },
});
document.getElementById('btn').addEventListener('click', () => fv.validate());
`.trim()
</script>

<ValidarePlayground :code="code" />

## Notes

- `form.submit()` is called directly — it bypasses the form's `submit` event. If you need to intercept submission (e.g., for AJAX), listen to `core.form.valid` instead and call your own handler.
- Do **not** name a submit button `name="submit"` — that shadows the native `form.submit()` method and will throw an error on install.
- Pair with `SubmitButton` to disable the submit button during async validation and re-enable on completion.
```

- [ ] **Step 2: Add DefaultSubmit to `validare-docs/plugins/index.md`**

Read the file. Find the Core Plugins table. Add after the Tooltip row:

```markdown
| [DefaultSubmit](./DefaultSubmit.md) | Automatically submits the form when all fields are valid |
```

- [ ] **Step 3: Update `validare-docs/.vitepress/config.ts` sidebar**

Find `"Core Plugins (9)"`. Change to `"Core Plugins (10)"`. Add `{ text: 'DefaultSubmit', link: '/plugins/DefaultSubmit' }` after the Tooltip entry.

- [ ] **Step 4: Build and copy UMD**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm run build
command cp dist/index.umd.js ../validare-docs/public/validare.umd.js
```

- [ ] **Step 5: Update BACKLOG.md**

In `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/superpowers/BACKLOG.md`, change:
```
| ⬜ Pendente | **DefaultSubmit** | Submete o form automaticamente quando todos os campos são válidos |
```
To:
```
| ✅ Concluído | **DefaultSubmit** | Submete o form automaticamente quando todos os campos são válidos |
```

- [ ] **Step 6: Commit validare**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add docs/superpowers/BACKLOG.md
git commit -m "docs: mark DefaultSubmit as completed in backlog"
```

- [ ] **Step 7: Commit validare-docs**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/DefaultSubmit.md plugins/index.md .vitepress/config.ts public/validare.umd.js
git commit -m "docs: add DefaultSubmit plugin page, update sidebar to Core Plugins (10)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Calls `form.submit()` on `core.form.valid`
- ✅ Respects `isEnabled()` guard
- ✅ Safety check for `name="submit"` button in `install()`
- ✅ `enabled: false` handled in constructor
- ✅ Cleanup on `uninstall()`
- ✅ 5 tests covering all behaviors
- ✅ VitePress page with playground (form.submit intercepted for demo)
- ✅ BACKLOG.md updated

**Placeholder scan:** None found.

**Type consistency:** No imported types beyond `Plugin`. `DefaultSubmitOptions` has index signature `[key: string]: unknown` required by `Plugin<T extends Record<string, unknown>>`.
