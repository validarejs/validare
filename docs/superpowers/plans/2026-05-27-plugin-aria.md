# Aria Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `Aria` plugin that sets `aria-invalid` on field elements and `aria-describedby` + `role="alert"` on message containers, enabling full screen-reader accessibility.

**Architecture:** The plugin listens to `core.element.validated` to set `aria-invalid` per element, and `core.field.validated` (which fires after all element events, so after Message has already updated the DOM) to set `aria-describedby` pointing to the message container. Works standalone (just `aria-invalid`) or alongside Message plugin (full `aria-describedby` support). No dependency on Message plugin internals — finds containers by `.fv-plugins-message-container` class.

**Tech Stack:** TypeScript, Vitest, JSDOM, existing validare plugin/filter pattern.

---

## File Map

```
src/plugins/core/Aria.ts          ← new plugin
src/plugins/index.ts              ← add export
tests/plugins/Aria.test.ts        ← new test file
validare-docs/plugins/Aria.md     ← new VitePress page
validare-docs/plugins/index.md    ← add Aria to Core Plugins table
validare-docs/.vitepress/config.ts ← add Aria to sidebar
validare-docs/public/validare.umd.js ← rebuild UMD
docs/superpowers/BACKLOG.md       ← mark Aria as ✅
```

---

## Task 1: Implement Aria plugin + tests

**Files:**
- Create: `src/plugins/core/Aria.ts`
- Modify: `src/plugins/index.ts`
- Create: `tests/plugins/Aria.test.ts`

### Context

**How Core events work:**
- `core.element.validated` — fires for each DOM element after it validates. Payload: `ElementValidatedPayload` (see below).
- `core.field.validated` — fires once per field after ALL elements finish. By this time, Message plugin has already created/updated `.fv-plugins-message-container` in the DOM.
- `core.field.removed` — fires when a field is removed. Payload: `{ field, elements, options }`.

**`ElementValidatedPayload` shape** (from `src/core/types.ts`):
```ts
{
  field: string;
  element: HTMLElement;       // The specific DOM element validated
  elements: HTMLElement[];    // All DOM elements for this field
  valid: boolean;
  result: 'Valid' | 'Invalid' | 'NotValidated';
  validators: Record<string, { valid: boolean; message: string; result: ValidationStatus }>;
}
```

**`core.field.validated` payload** (from `src/core/Core.ts`):
```ts
{ field: string; result: ValidationStatus; elements: HTMLElement[] }
```

**Message plugin behavior:** When `core.element.validated` fires and field is invalid, Message creates a `div.fv-plugins-message-container` inserted immediately after the input element (`element.insertAdjacentElement('afterend', container)`). So after `core.field.validated` fires, we can find the container via `element.nextElementSibling`.

**Plugin base class pattern** (from `src/plugins/core/Icon.ts`):
```ts
export class MyPlugin extends Plugin<MyPluginOptions> {
  private handler = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    // ...
  };
  install(): void { this.core.on('event', this.handler); }
  uninstall(): void { this.core.off('event', this.handler); }
}
```

**Current `src/plugins/index.ts` tail** (add new exports here):
```ts
export { Sequence } from "./core/Sequence";
export type { SequenceOptions } from "./core/Sequence";
// ... (Transformer is last core plugin)
export { Transformer } from "./core/Transformer";
export type { TransformerOptions } from "./core/Transformer";
```

---

- [ ] **Step 1: Create `src/plugins/core/Aria.ts`**

```ts
import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload, ValidationStatus } from "../../core/types";

export interface AriaOptions {
  [key: string]: unknown;
}

export class Aria extends Plugin<AriaOptions> {
  private containerIds = new Map<string, string>();

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid } = payload as ElementValidatedPayload;
    element.setAttribute("aria-invalid", valid ? "false" : "true");
  };

  private onFieldValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { field, result, elements } = payload as {
      field: string;
      result: ValidationStatus;
      elements: HTMLElement[];
    };

    if (result === "Invalid") {
      // Find the message container inserted by Message plugin after the element
      let container: HTMLElement | null = null;
      for (const el of elements) {
        const sibling = el.nextElementSibling as HTMLElement | null;
        if (sibling?.classList.contains("fv-plugins-message-container")) {
          container = sibling;
          break;
        }
      }

      if (container) {
        if (!this.containerIds.has(field)) {
          this.containerIds.set(field, `fv-aria-${field}-messages`);
        }
        const id = this.containerIds.get(field)!;
        container.id = id;
        container.setAttribute("role", "alert");
        for (const el of elements) {
          el.setAttribute("aria-describedby", id);
        }
      }
    } else {
      for (const el of elements) {
        el.removeAttribute("aria-describedby");
      }
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { field, elements } = payload as { field: string; elements: HTMLElement[] };
    this.containerIds.delete(field);
    for (const el of elements) {
      el.removeAttribute("aria-invalid");
      el.removeAttribute("aria-describedby");
    }
  };

  install(): void {
    this.core.on("core.element.validated", this.onElementValidated);
    this.core.on("core.field.validated", this.onFieldValidated);
    this.core.on("core.field.removed", this.onFieldRemoved);
  }

  uninstall(): void {
    this.core.off("core.element.validated", this.onElementValidated);
    this.core.off("core.field.validated", this.onFieldValidated);
    this.core.off("core.field.removed", this.onFieldRemoved);
    this.containerIds.clear();
  }
}
```

- [ ] **Step 2: Add export to `src/plugins/index.ts`**

Find the line:
```ts
export { Transformer } from "./core/Transformer";
export type { TransformerOptions } from "./core/Transformer";
```

Add after it:
```ts
export { Aria } from "./core/Aria";
export type { AriaOptions } from "./core/Aria";
```

- [ ] **Step 3: Create `tests/plugins/Aria.test.ts`**

```ts
import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src";
import { Aria } from "../../src/plugins/core/Aria";
import { Message } from "../../src/plugins/core/Message";
import { makeForm } from "../helpers";

describe("Aria", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("sets aria-invalid=true on invalid element", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid=false on valid element", async () => {
    const form = makeForm({ email: "hello" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("false");
  });

  it("sets aria-describedby and role=alert on message container when Message plugin is present", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { message: new Message(), aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const container = form.querySelector(".fv-plugins-message-container") as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.id).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe(container.id);
    expect(container.getAttribute("role")).toBe("alert");
  });

  it("removes aria-describedby when field becomes valid", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { message: new Message(), aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-describedby")).toBeTruthy();

    // Make field valid and re-validate
    input.value = "hello";
    fv.resetField("email");
    await fv.validateField("email");
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("sets aria-invalid without Message plugin (no aria-describedby)", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("cleans up aria attributes on field removed", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    fv.removeField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("uninstall removes all listeners and clears state", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    fv.deregisterPlugin("aria");
    // After deregister, validating again should not change aria-invalid
    fv.resetField("email");
    const inputBefore = form.querySelector('[name="email"]') as HTMLInputElement;
    const attrBefore = inputBefore.getAttribute("aria-invalid");
    await fv.validateField("email");
    expect(inputBefore.getAttribute("aria-invalid")).toBe(attrBefore);
  });
});
```

- [ ] **Step 4: Run Aria tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/Aria.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all tests pass (previous count was ~711; new total ~718).

- [ ] **Step 6: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add src/plugins/core/Aria.ts src/plugins/index.ts tests/plugins/Aria.test.ts
git commit -m "feat(aria): add Aria plugin for aria-invalid and aria-describedby accessibility"
```

---

## Task 2: VitePress docs + rebuild UMD + update backlog

**Files:**
- Create: `validare-docs/plugins/Aria.md`
- Modify: `validare-docs/plugins/index.md`
- Modify: `validare-docs/.vitepress/config.ts`
- Modify: `validare-docs/public/validare.umd.js` (rebuild)
- Modify: `validare/docs/superpowers/BACKLOG.md`

### Context

**How VitePress plugin pages are structured:** Read `validare-docs/plugins/Message.md` as reference — it has: intro paragraph, Options table, Playground section with `<ValidarePlayground>` component, Notes section.

**Playground component:** `<ValidarePlayground :code="code" />` where `code` is a JS string with `document.body.innerHTML = ...` + `validare(...)`. The playground iframe runs the code directly using the UMD bundle. Imports are via destructuring from `Validare` global.

**`validare-docs/plugins/index.md` Core Plugins table** — currently has 6 rows (Trigger, Message, Icon, SubmitButton, Excluded, Sequence). Add Aria as the 7th row.

**`validare-docs/.vitepress/config.ts` sidebar** — find the `"Core Plugins (6)"` group and change it to `"Core Plugins (7)"`, adding Aria to the items list.

**UMD copy command:** Use `command cp` (not `cp`) to bypass macOS `cp` alias that prompts for overwrite confirmation.

---

- [ ] **Step 1: Create `validare-docs/plugins/Aria.md`**

```md
# `Aria` Plugin

Adds ARIA accessibility attributes to form fields, enabling screen readers to announce validation errors.

## Options

This plugin has no configurable options.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enable or disable the plugin |

## Playground

When a field is invalid, inspect the input element in your browser's DevTools to see `aria-invalid="true"` and `aria-describedby` pointing to the error container.

<script setup>
const code = `
document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="button" id="btn">Validate</button>
    <p id="out" style="margin-top:8px;font-size:13px;color:#555"></p>
  </form>
\`;
const { validare, Message, Aria } = Validare;
const fv = validare(document.getElementById('demo'), {
  fields: {
    email: {
      validators: {
        notEmpty: { message: 'Email is required' },
        email:    { message: 'Please enter a valid email address' },
      },
    },
  },
  plugins: {
    message: new Message(),
    aria:    new Aria(),
  },
});
document.getElementById('btn').addEventListener('click', async () => {
  await fv.validate();
  const input = document.querySelector('[name="email"]');
  const out = document.getElementById('out');
  out.textContent = 'aria-invalid="' + input.getAttribute('aria-invalid') + '"'
    + (input.getAttribute('aria-describedby')
        ? ', aria-describedby="' + input.getAttribute('aria-describedby') + '"'
        : '');
});
`.trim()
</script>

<ValidarePlayground :code="code" />

## Notes

- Sets `aria-invalid="true"` on invalid elements and `aria-invalid="false"` on valid elements.
- When used alongside the `Message` plugin, also sets `aria-describedby` on the field pointing to the error container, and `role="alert"` on the container so screen readers announce new errors.
- Works without `Message` — only `aria-invalid` is set in that case.
- For radio/checkbox groups, `aria-describedby` is set on all elements in the group.
```

- [ ] **Step 2: Add Aria to `validare-docs/plugins/index.md`**

Find the Core Plugins table in `validare-docs/plugins/index.md`. It currently ends with the Sequence row. Add Aria as the next row:

```markdown
| [Aria](./Aria.md) | Adds `aria-invalid` and `aria-describedby` for screen reader accessibility |
```

- [ ] **Step 3: Update `validare-docs/.vitepress/config.ts` sidebar**

Find:
```ts
{ text: 'Core Plugins (6)', ...
```

Change to `Core Plugins (7)` and add `{ text: 'Aria', link: '/plugins/Aria' }` to the items list (alphabetical order — after the existing entries, or before Excluded).

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
| ⬜ Pendente | **Aria** | Adiciona `aria-invalid` e `aria-describedby` nos campos — acessibilidade básica |
```

To:

```markdown
| ✅ Concluído | **Aria** | Adiciona `aria-invalid` e `aria-describedby` nos campos — acessibilidade básica |
```

- [ ] **Step 6: Commit validare**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add docs/superpowers/BACKLOG.md
git commit -m "docs: mark Aria as completed in backlog"
```

- [ ] **Step 7: Commit validare-docs**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/Aria.md plugins/index.md .vitepress/config.ts public/validare.umd.js
git commit -m "docs: add Aria plugin page and update sidebar"
```

---

## Self-Review

**Spec coverage:**
- ✅ `aria-invalid="true"` on invalid element
- ✅ `aria-invalid="false"` on valid element
- ✅ `aria-describedby` pointing to message container when Message plugin present
- ✅ `role="alert"` on message container
- ✅ Works without Message plugin (graceful degradation)
- ✅ Cleanup on `core.field.removed`
- ✅ Cleanup on `uninstall()`
- ✅ VitePress docs page
- ✅ BACKLOG.md updated

**Placeholder scan:** None found.

**Type consistency:** `ValidationStatus` imported from `../../core/types` in both Aria.ts and types.ts — consistent. Payload shapes match Core.ts emit calls exactly.
