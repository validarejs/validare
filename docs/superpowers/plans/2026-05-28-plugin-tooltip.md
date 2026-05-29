# Tooltip Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Tooltip` plugin that shows validation error messages in a floating tooltip on hover or click, as an alternative to the `Message` plugin.

**Architecture:** The plugin creates a single `div.fv-plugins-tooltip` in `document.body` and tracks the first failing message per field element via `core.element.validated`. When the user hovers (default) or clicks the field element, the tooltip is positioned and made visible. No dependency on the `Icon` plugin — triggers attach directly to field elements. Cleanup in `uninstall()` removes all listeners, clears messages, and removes the tooltip from the DOM.

**Tech Stack:** TypeScript, Vitest, JSDOM, existing validare plugin pattern.

---

## Design Notes

- **Single floating tooltip div** — one `div.fv-plugins-tooltip` in `document.body`, shown/hidden via CSS class `fv-plugins-tooltip--show`.
- **Trigger:** `hover` (default) attaches `mouseenter`/`mouseleave` to the field element; `click` attaches `click` to the field element and hides on `document` click.
- **Placement:** `top` (default), `bottom`, `left`, `right` — positioned via `getBoundingClientRect()` + scroll offsets. In JSDOM (no layout), position is 0,0 but show/hide behavior is still fully testable.
- **Message source:** first failing validator with a non-empty message from `ElementValidatedPayload.validators`.
- **`currentElement` tracker:** used to hide the tooltip when the currently-shown field becomes valid.
- **`enabled: false`:** Plugin base class does NOT handle this automatically — constructor must call `this.disable()`.
- Tooltip goes in **Core Plugins** section (alternative display mechanism like Message and Icon).

---

## File Map

```
src/plugins/core/Tooltip.ts          ← new plugin
src/plugins/index.ts                 ← add export (after AutoFocus)
tests/plugins/Tooltip.test.ts        ← new test file
validare-docs/plugins/Tooltip.md     ← new VitePress page
validare-docs/plugins/index.md       ← add to Core Plugins table
validare-docs/.vitepress/config.ts   ← Core Plugins (8) → (9)
validare-docs/public/validare.umd.js ← rebuild UMD
docs/superpowers/BACKLOG.md          ← mark Tooltip as ✅
```

---

## Task 1: Implement Tooltip plugin + tests

**Files:**
- Create: `src/plugins/core/Tooltip.ts`
- Modify: `src/plugins/index.ts`
- Create: `tests/plugins/Tooltip.test.ts`

### Context

**`core.element.validated` payload** (`ElementValidatedPayload` from `src/core/types.ts`):
```ts
{
  field: string;
  element: HTMLElement;
  elements: HTMLElement[];
  valid: boolean;
  result: ValidationStatus;
  validators: Record<string, { valid: boolean; message: string; result: ValidationStatus }>;
}
```

**Import paths:**
```ts
import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload } from "../../core/types";
```

**Plugin base class:** `this.core`, `this.opts`, `this.isEnabled()`, `install()`, `uninstall()`.
Does NOT handle `enabled: false` from opts — constructor must call `this.disable()` explicitly.

**Test helpers:** `import { makeForm } from "../helpers"` — creates a form with named inputs appended to `document.body`.

---

- [ ] **Step 1: Create `src/plugins/core/Tooltip.ts`**

```ts
import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload } from "../../core/types";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipTrigger = "hover" | "click";

export interface TooltipOptions {
  /** Where the tooltip appears relative to the field element. Default: 'top' */
  placement?: TooltipPlacement;
  /** What triggers the tooltip. Default: 'hover' */
  trigger?: TooltipTrigger;
  [key: string]: unknown;
}

export class Tooltip extends Plugin<TooltipOptions> {
  private tip!: HTMLElement;
  private messages = new Map<HTMLElement, string>();
  private currentElement: HTMLElement | null = null;
  private triggerListeners = new Map<
    HTMLElement,
    { show: (e: MouseEvent) => void; hide?: () => void }
  >();

  constructor(opts?: TooltipOptions) {
    super({ placement: "top", trigger: "hover", ...opts });
    if (opts?.enabled === false) this.disable();
  }

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid, validators } = payload as ElementValidatedPayload;

    if (!valid) {
      const firstFailing = Object.values(validators).find((r) => !r.valid && r.message);
      if (firstFailing) {
        this.messages.set(element, firstFailing.message);
        this.attachTrigger(element);
      }
    } else {
      if (this.currentElement === element) {
        this.hideTip();
      }
      this.messages.delete(element);
      this.detachTrigger(element);
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { elements } = payload as { elements: HTMLElement[] };
    for (const el of elements) {
      if (this.currentElement === el) this.hideTip();
      this.messages.delete(el);
      this.detachTrigger(el);
    }
  };

  private onDocumentClicked = (): void => {
    this.hideTip();
  };

  private attachTrigger(element: HTMLElement): void {
    if (this.triggerListeners.has(element)) return;
    const trigger = this.opts.trigger ?? "hover";

    if (trigger === "hover") {
      const show = () => this.showTip(element);
      const hide = () => this.hideTip();
      element.addEventListener("mouseenter", show);
      element.addEventListener("mouseleave", hide);
      this.triggerListeners.set(element, { show, hide });
    } else {
      const show = (e: MouseEvent) => {
        e.stopPropagation();
        this.showTip(element);
      };
      element.addEventListener("click", show);
      this.triggerListeners.set(element, { show });
    }
  }

  private detachTrigger(element: HTMLElement): void {
    const listeners = this.triggerListeners.get(element);
    if (!listeners) return;
    const trigger = this.opts.trigger ?? "hover";
    if (trigger === "hover") {
      element.removeEventListener("mouseenter", listeners.show);
      if (listeners.hide) element.removeEventListener("mouseleave", listeners.hide);
    } else {
      element.removeEventListener("click", listeners.show);
    }
    this.triggerListeners.delete(element);
  }

  private showTip(element: HTMLElement): void {
    const message = this.messages.get(element);
    if (!message) return;

    this.currentElement = element;
    this.tip.textContent = message;
    this.tip.classList.add("fv-plugins-tooltip--show");

    const rect = element.getBoundingClientRect();
    const tipRect = this.tip.getBoundingClientRect();
    const scrollTop = window.scrollY ?? 0;
    const scrollLeft = window.scrollX ?? 0;
    const placement = this.opts.placement ?? "top";

    let top = 0;
    let left = 0;
    switch (placement) {
      case "bottom":
        top = rect.bottom + scrollTop;
        left = rect.left + rect.width / 2 - tipRect.width / 2 + scrollLeft;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tipRect.height / 2 + scrollTop;
        left = rect.left - tipRect.width + scrollLeft;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tipRect.height / 2 + scrollTop;
        left = rect.right + scrollLeft;
        break;
      case "top":
      default:
        top = rect.top - tipRect.height + scrollTop;
        left = rect.left + rect.width / 2 - tipRect.width / 2 + scrollLeft;
        break;
    }
    this.tip.style.top = `${top}px`;
    this.tip.style.left = `${left}px`;
  }

  private hideTip(): void {
    this.currentElement = null;
    this.tip.classList.remove("fv-plugins-tooltip--show");
    this.tip.textContent = "";
  }

  install(): void {
    this.tip = document.createElement("div");
    this.tip.className = `fv-plugins-tooltip fv-plugins-tooltip--${this.opts.placement ?? "top"}`;
    document.body.appendChild(this.tip);

    this.core.on("core.element.validated", this.onElementValidated);
    this.core.on("core.field.removed", this.onFieldRemoved);

    if ((this.opts.trigger ?? "hover") === "click") {
      document.addEventListener("click", this.onDocumentClicked);
    }
  }

  uninstall(): void {
    this.core.off("core.element.validated", this.onElementValidated);
    this.core.off("core.field.removed", this.onFieldRemoved);

    if ((this.opts.trigger ?? "hover") === "click") {
      document.removeEventListener("click", this.onDocumentClicked);
    }

    for (const element of [...this.triggerListeners.keys()]) {
      this.detachTrigger(element);
    }

    this.messages.clear();
    this.currentElement = null;
    this.tip.parentNode?.removeChild(this.tip);
  }
}
```

- [ ] **Step 2: Add export to `src/plugins/index.ts`**

Read the file. Find the AutoFocus export lines. Add after them:

```ts
export { Tooltip } from "./core/Tooltip";
export type { TooltipOptions, TooltipPlacement, TooltipTrigger } from "./core/Tooltip";
```

- [ ] **Step 3: Create `tests/plugins/Tooltip.test.ts`**

```ts
import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src";
import { Tooltip } from "../../src/plugins/core/Tooltip";
import { makeForm } from "../helpers";

describe("Tooltip", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("creates tooltip element in document.body on install", () => {
    const form = makeForm({ email: "" });
    validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: {} } },
    });
    const tip = document.querySelector(".fv-plugins-tooltip");
    expect(tip).toBeTruthy();
    expect(document.body.contains(tip)).toBe(true);
  });

  it("shows tooltip message on mouseenter (hover trigger, default)", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Email is required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;

    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(false);
    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(true);
    expect(tip.textContent).toBe("Email is required");
  });

  it("hides tooltip on mouseleave", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Email is required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(true);
    input.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(false);
  });

  it("shows tooltip on click with click trigger", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip({ trigger: "click" }) },
      fields: { email: { validators: { notEmpty: { message: "Email is required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(true);
    expect(tip.textContent).toBe("Email is required");
  });

  it("hides tooltip on document click (click trigger)", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip({ trigger: "click" }) },
      fields: { email: { validators: { notEmpty: { message: "Email is required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(true);

    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(false);
  });

  it("does not show tooltip for valid field", async () => {
    const form = makeForm({ email: "test@test.com" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(false);
    expect(tip.textContent).toBe("");
  });

  it("hides tooltip when field transitions from invalid to valid", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;

    // Show tooltip
    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(true);

    // Make field valid
    input.value = "filled";
    fv.resetField("email");
    await fv.validateField("email");
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(false);
  });

  it("cleans up on field removed", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(true);

    fv.removeField("email");
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(false);
  });

  it("removes tooltip from document.body on uninstall", () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: {} } },
    });
    expect(document.querySelector(".fv-plugins-tooltip")).toBeTruthy();
    fv.deregisterPlugin("tooltip");
    expect(document.querySelector(".fv-plugins-tooltip")).toBeNull();
  });

  it("does nothing when disabled", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip({ enabled: false }) },
      fields: { email: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("fv-plugins-tooltip--show")).toBe(false);
  });

  it("applies placement class to tooltip element", () => {
    const form = makeForm({ email: "" });
    validare(form, {
      plugins: { tooltip: new Tooltip({ placement: "bottom" }) },
      fields: { email: { validators: {} } },
    });
    const tip = document.querySelector(".fv-plugins-tooltip") as HTMLElement;
    expect(tip.classList.contains("fv-plugins-tooltip--bottom")).toBe(true);
  });
});
```

- [ ] **Step 4: Run Tooltip tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/Tooltip.test.ts
```

Expected: all 10 tests pass. If any fail, fix the implementation.

- [ ] **Step 5: Run full test suite**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add src/plugins/core/Tooltip.ts src/plugins/index.ts tests/plugins/Tooltip.test.ts
git commit -m "feat(tooltip): add Tooltip plugin with hover/click trigger and placement options"
```

---

## Task 2: VitePress docs + rebuild UMD + update backlog

**Files:**
- Create: `validare-docs/plugins/Tooltip.md`
- Modify: `validare-docs/plugins/index.md` (Core Plugins table)
- Modify: `validare-docs/.vitepress/config.ts` (Core Plugins 8→9)
- Modify: `validare-docs/public/validare.umd.js` (rebuild)
- Modify: `docs/superpowers/BACKLOG.md`

### Context

**VitePress page structure:** Read `validare-docs/plugins/AutoFocus.md` as reference.

**`plugins/index.md` Core Plugins table** — currently has 8 rows. Add Tooltip.

**`.vitepress/config.ts` sidebar** — find `"Core Plugins (8)"`, change to `"Core Plugins (9)"`, add `{ text: 'Tooltip', link: '/plugins/Tooltip' }` after AutoFocus.

**UMD copy:** use `command cp` (not `cp`).

---

- [ ] **Step 1: Create `validare-docs/plugins/Tooltip.md`**

```md
# `Tooltip` Plugin

Displays validation error messages in a floating tooltip instead of a static message block, triggered by hovering or clicking the invalid field.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enable or disable the plugin |
| `placement` | `string` | `'top'` | Tooltip position: `'top'`, `'bottom'`, `'left'`, `'right'` |
| `trigger` | `string` | `'hover'` | Show trigger: `'hover'` (mouseenter/mouseleave) or `'click'` (click field; document click hides) |

## Playground

Validate the form, then hover over the invalid field to see the tooltip.

<script setup>
const code = `
document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" placeholder="user@example.com">
    </div>
    <div class="field">
      <label>Name</label>
      <input type="text" name="name" placeholder="Your name">
    </div>
    <button type="button" id="btn">Validate</button>
  </form>
  <style>
    .fv-plugins-tooltip {
      position: absolute;
      z-index: 9999;
      background: #1e293b;
      color: #fff;
      font-size: 12px;
      padding: 5px 10px;
      border-radius: 4px;
      pointer-events: none;
      white-space: nowrap;
      display: none;
    }
    .fv-plugins-tooltip--show { display: block; }
    .fv-plugins-tooltip--top { margin-top: -4px; transform: translateY(-100%); }
    .fv-plugins-tooltip--bottom { margin-top: 4px; }
  </style>
\`;
const { validare, Tooltip } = Validare;
const fv = validare(document.getElementById('demo'), {
  fields: {
    email: { validators: {
      notEmpty: { message: 'Email is required' },
      email:    { message: 'Please enter a valid email' },
    }},
    name: { validators: {
      notEmpty: { message: 'Name is required' },
    }},
  },
  plugins: {
    tooltip: new Tooltip({ placement: 'top', trigger: 'hover' }),
  },
});
document.getElementById('btn').addEventListener('click', () => fv.validate());
`.trim()
</script>

<ValidarePlayground :code="code" />

## Notes

- Tooltip is an **alternative to `Message`** — use one or the other (both can coexist but it's unusual).
- The plugin creates a single `div.fv-plugins-tooltip` in `document.body` and positions it using `getBoundingClientRect`.
- Add CSS for `.fv-plugins-tooltip` and `.fv-plugins-tooltip--show` to control appearance (the plugin only handles visibility and position).
- With `trigger: 'click'`, clicking the field shows the tooltip; clicking anywhere else hides it.
- Use `Tooltip` alongside `Trigger` (with `event: 'input'`) for live feedback as the user types.
```

- [ ] **Step 2: Add Tooltip to `validare-docs/plugins/index.md`**

Read the file. Find the Core Plugins table. Add after the AutoFocus row:

```markdown
| [Tooltip](./Tooltip.md) | Shows error messages in a floating tooltip on hover or click |
```

- [ ] **Step 3: Update `validare-docs/.vitepress/config.ts` sidebar**

Find `"Core Plugins (8)"`. Change to `"Core Plugins (9)"`. Add `{ text: 'Tooltip', link: '/plugins/Tooltip' }` after the AutoFocus entry.

- [ ] **Step 4: Build and copy UMD**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm run build
command cp dist/index.umd.js ../validare-docs/public/validare.umd.js
```

- [ ] **Step 5: Update BACKLOG.md**

In `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/superpowers/BACKLOG.md`, change:
```
| ⬜ Pendente | **Tooltip** | Exibe mensagens de erro num tooltip em vez de div abaixo do campo |
```
To:
```
| ✅ Concluído | **Tooltip** | Exibe mensagens de erro num tooltip em vez de div abaixo do campo |
```

- [ ] **Step 6: Commit validare**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add docs/superpowers/BACKLOG.md
git commit -m "docs: mark Tooltip as completed in backlog"
```

- [ ] **Step 7: Commit validare-docs**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/Tooltip.md plugins/index.md .vitepress/config.ts public/validare.umd.js
git commit -m "docs: add Tooltip plugin page, update sidebar to Core Plugins (9)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Floating tooltip div in `document.body`
- ✅ `trigger: hover` — mouseenter shows, mouseleave hides
- ✅ `trigger: click` — field click shows, document click hides (stopPropagation prevents immediate hide)
- ✅ `placement` option (top/bottom/left/right) — class + position calculation
- ✅ Message from first failing validator with non-empty message
- ✅ No message on valid field — no trigger attached
- ✅ Tooltip hidden when field transitions to valid (`currentElement` tracker)
- ✅ Cleanup on `core.field.removed`
- ✅ Full cleanup on `uninstall()` — listeners, tooltip DOM, messages map
- ✅ `enabled: false` handled in constructor
- ✅ 10 tests covering all behaviors
- ✅ VitePress page with playground + CSS hint in playground code
- ✅ BACKLOG.md updated

**Placeholder scan:** None found.

**Type consistency:** `ElementValidatedPayload` imported from `../../core/types` — same as Message, Icon, Aria. `TooltipOptions` has index signature `[key: string]: unknown` required by `Plugin<T extends Record<string, unknown>>`.
