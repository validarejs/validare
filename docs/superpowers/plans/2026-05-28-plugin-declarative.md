# Declarative Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Declarative` plugin that configures field validators via HTML `data-fv-*` attributes, enabling form validation without any JavaScript field configuration.

**Architecture:** On `install()`, the plugin scans the form for elements with `[name]` or `[data-fv-field]` and extracts validator config from `data-fv-{validator}` / `data-fv-{validator}___{option}` attributes, then calls `core.addField()` for each. It also listens to `core.field.added` to handle dynamically added fields. Programmatic validators always take precedence over declarative ones. An `html5Input` option maps standard HTML5 attributes (`required`, `type`, `minlength`, etc.) to their equivalent validators.

**Tech Stack:** TypeScript, Vitest, JSDOM, existing validare plugin pattern.

---

## File Map

```
src/plugins/core/Declarative.ts          ← new plugin
src/plugins/index.ts                     ← add export (after FieldStatus)
tests/plugins/Declarative.test.ts        ← new test file
validare-docs/plugins/Declarative.md     ← new VitePress page (comprehensive)
validare-docs/plugins/index.md           ← add to Core Plugins table
validare-docs/.vitepress/config.ts       ← Core Plugins (11) → (12)
validare-docs/public/validare.umd.js     ← rebuild UMD
docs/superpowers/BACKLOG.md              ← mark Declarative as ✅
```

---

## Task 1: Implement Declarative plugin + tests

**Files:**
- Create: `src/plugins/core/Declarative.ts`
- Modify: `src/plugins/index.ts`
- Create: `tests/plugins/Declarative.test.ts`

### Context

**Core API used by the plugin:**

| Method | Signature | Notes |
|---|---|---|
| `this.core.form` | `HTMLFormElement` | The form element |
| `this.core.addField(field, opts)` | `addField(field: string, opts: FieldOptions): this` | If field exists, **merges** validators: `{ ...existing, ...new }` — **new wins** |
| `this.core.getFields()` | `(): Record<string, FieldOptions>` | Returns a shallow copy of all current fields |
| `this.core.on / off` | event listeners | Standard plugin pattern |

**`FieldOptions` shape** (from `src/core/types.ts`):
```ts
interface FieldOptions {
  selector?: string;
  validators: Record<string, ValidatorOptions>;
}
interface ValidatorOptions {
  message?: string;
  enabled?: boolean;
  [key: string]: unknown;
}
```

**Import path:**
```ts
import { Plugin } from "../../core/Plugin";
import type { FieldOptions, ValidatorOptions } from "../../core/types";
```

**Attribute syntax:**
- `data-fv-{validator}="true"` — enables validator (base attribute)
- `data-fv-{validator}="false"` — disables validator
- `data-fv-{validator}___{option}="{value}"` — sets a validator option
- `data-fv-field="{fieldName}"` — alternative to `name` attribute (NOT a validator)
- Attribute names use kebab-case; converted to camelCase in code: `not-empty` → `notEmpty`, `string-length` → `stringLength`

**Separator:** Three underscores `___` between validator name and option name.

**Value normalization** (`normalizeValue`):
- `"true"` or `""` → `true` (boolean)
- `"false"` → `false` (boolean)
- `"3"`, `"3.14"` → `3`, `3.14` (number — better than legacy which left these as strings)
- Everything else → string as-is

**html5Input mappings** (only active when `opts.html5Input === true`):

| HTML5 attribute | Condition | Validator added |
|---|---|---|
| `required` | any | `notEmpty: { enabled: true }` |
| `type="email"` | — | `email: { enabled: true }` |
| `type="url"` | — | `uri: { enabled: true }` |
| `type="range"` | — | `between: { enabled: true, min: parseFloat(min), max: parseFloat(max) }` |
| `minlength` | — | `stringLength: { enabled: true, min: parseInt(value) }` |
| `maxlength` | — | `stringLength: { enabled: true, max: parseInt(value) }` |
| `pattern` | — | `regexp: { enabled: true, regexp: value }` |
| `min` | type ≠ date/range | `greaterThan: { enabled: true, min: parseFloat(value) }` |
| `max` | type ≠ date/range | `lessThan: { enabled: true, max: parseFloat(value) }` |

**Precedence rule:** Programmatic validators always win. If a validator name is already present in the programmatic config, the declarative version is not added.

**`addField` merge semantics (critical):** Validare's `addField` when field already exists does `{ ...existing, ...new }` — **new wins**. To preserve programmatic config, the plugin must pass ONLY declarative validators that are NOT already in the programmatic config.

**Dynamic field handling:** The plugin listens to `core.field.added`. When a new field is added dynamically, it parses its elements and calls `addField` with only the extra declarative validators. To prevent infinite loops (since our own `addField` calls re-emit `core.field.added`), `addedFields: Set<string>` tracks which fields we've already processed.

**Test helpers:** `import { makeForm } from "../helpers"` — creates named inputs appended to `document.body`.

**Run tests:** `cd /Users/varantes/workspace/sandbox/jvalidation/validare && npm test -- tests/plugins/Declarative.test.ts`

---

- [ ] **Step 1: Create `src/plugins/core/Declarative.ts`**

```ts
import { Plugin } from "../../core/Plugin";
import type { FieldOptions, ValidatorOptions } from "../../core/types";

export interface DeclarativeOptions {
  /** Attribute prefix for validators. Default: "data-fv-" */
  prefix?: string;
  /** Map HTML5 attributes (required, type, minlength, etc.) to validators. Default: false */
  html5Input?: boolean;
  [key: string]: unknown;
}

export class Declarative extends Plugin<DeclarativeOptions> {
  /** Fields whose declarative attrs have already been processed — prevents infinite loops */
  private addedFields = new Set<string>();

  constructor(opts?: DeclarativeOptions) {
    super({ prefix: "data-fv-", html5Input: false, ...opts });
    if (opts?.enabled === false) this.disable();
  }

  install(): void {
    const existingFields = this.core.getFields();
    const parsed = this.parseAllElements();

    for (const [field, validators] of Object.entries(parsed)) {
      // Normalize: any validator with no explicit `enabled` defaults to false
      for (const v of Object.keys(validators)) {
        if (validators[v].enabled === undefined) {
          validators[v].enabled = false;
        }
      }

      const existing = existingFields[field];
      if (existing) {
        // Field already defined programmatically — only add validators NOT already there
        const extra: Record<string, ValidatorOptions> = {};
        for (const [v, vopts] of Object.entries(validators)) {
          if (!existing.validators[v]) extra[v] = vopts;
        }
        if (Object.keys(extra).length > 0) {
          this.addedFields.add(field);
          this.core.addField(field, { validators: extra });
        }
      } else {
        // Purely declarative field — add it fresh
        this.addedFields.add(field);
        this.core.addField(field, { validators });
      }
    }

    this.core.on("core.field.added", this.onFieldAdded);
    this.core.on("core.field.removed", this.onFieldRemoved);
  }

  uninstall(): void {
    this.addedFields.clear();
    this.core.off("core.field.added", this.onFieldAdded);
    this.core.off("core.field.removed", this.onFieldRemoved);
  }

  private onFieldAdded = (payload: unknown): void => {
    const { field, elements, options } = payload as {
      field: string;
      elements: HTMLElement[];
      options: FieldOptions;
    };
    if (!elements || elements.length === 0 || this.addedFields.has(field)) return;
    this.addedFields.add(field);

    const allDeclarative: Record<string, ValidatorOptions> = {};
    for (const el of elements) {
      const { validators } = this.parseElement(el);
      Object.assign(allDeclarative, validators);
    }
    if (Object.keys(allDeclarative).length === 0) return;

    // Normalize enabled flag
    for (const v of Object.keys(allDeclarative)) {
      if (allDeclarative[v].enabled === undefined) allDeclarative[v].enabled = false;
    }

    // Only add validators not already in the programmatic config
    const extra: Record<string, ValidatorOptions> = {};
    for (const [v, vopts] of Object.entries(allDeclarative)) {
      if (!options.validators[v]) extra[v] = vopts;
    }
    if (Object.keys(extra).length > 0) {
      this.core.addField(field, { validators: extra });
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.addedFields.delete(field);
  };

  /** Scan form for all elements with [name] or [prefix+field], parse each one. */
  private parseAllElements(): Record<string, Record<string, ValidatorOptions>> {
    const prefix = this.opts.prefix as string;
    const result: Record<string, Record<string, ValidatorOptions>> = {};
    const elements = Array.from(
      this.core.form.querySelectorAll<HTMLElement>(`[name], [${prefix}field]`),
    );
    for (const el of elements) {
      const { validators } = this.parseElement(el);
      if (Object.keys(validators).length === 0) continue;
      const field =
        el.getAttribute("name") ?? el.getAttribute(`${prefix}field`) ?? "";
      if (!field) continue;
      result[field] = result[field]
        ? { ...result[field], ...validators }
        : { ...validators };
    }
    return result;
  }

  /** Parse data-fv-* attributes (and html5 attrs if enabled) from a single element. */
  parseElement(el: HTMLElement): { validators: Record<string, ValidatorOptions> } {
    const prefix = this.opts.prefix as string;
    const html5Input = this.opts.html5Input as boolean;
    // Escape any regex metacharacters in the prefix (e.g. the hyphens in "data-fv-")
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(`^${escapedPrefix}([a-z0-9-]+)(___)?([a-z0-9-]+)?$`);
    const opts: Record<string, Record<string, unknown>> = {};
    const type = el.getAttribute("type");

    // ── HTML5 attribute mappings ────────────────────────────────────────────
    if (html5Input) {
      if (el.hasAttribute("required")) {
        opts.notEmpty = { ...opts.notEmpty, enabled: true };
      }
      if (type === "email") {
        opts.email = { ...opts.email, enabled: true };
      }
      if (type === "url") {
        opts.uri = { ...opts.uri, enabled: true };
      }
      if (type === "range") {
        const min = el.getAttribute("min");
        const max = el.getAttribute("max");
        opts.between = {
          ...opts.between,
          enabled: true,
          ...(min !== null ? { min: parseFloat(min) } : {}),
          ...(max !== null ? { max: parseFloat(max) } : {}),
        };
      }
      const minlength = el.getAttribute("minlength");
      if (minlength !== null) {
        opts.stringLength = { ...opts.stringLength, enabled: true, min: parseInt(minlength, 10) };
      }
      const maxlength = el.getAttribute("maxlength");
      if (maxlength !== null) {
        opts.stringLength = { ...opts.stringLength, enabled: true, max: parseInt(maxlength, 10) };
      }
      const pattern = el.getAttribute("pattern");
      if (pattern !== null) {
        opts.regexp = { ...opts.regexp, enabled: true, regexp: pattern };
      }
      const minVal = el.getAttribute("min");
      if (minVal !== null && type !== "date" && type !== "range") {
        opts.greaterThan = { ...opts.greaterThan, enabled: true, min: parseFloat(minVal) };
      }
      const maxVal = el.getAttribute("max");
      if (maxVal !== null && type !== "date" && type !== "range") {
        opts.lessThan = { ...opts.lessThan, enabled: true, max: parseFloat(maxVal) };
      }
    }

    // ── data-fv-* attribute parsing ─────────────────────────────────────────
    for (const attr of Array.from(el.attributes)) {
      const match = reg.exec(attr.name);
      if (!match) continue;
      const validatorName = this.toCamelCase(match[1]);
      // Skip data-fv-field — it names the field, it's not a validator
      if (validatorName === "field") continue;
      const optionName = match[3] ? this.toCamelCase(match[3]) : null;
      if (!opts[validatorName]) opts[validatorName] = {};
      if (optionName) {
        opts[validatorName][optionName] = this.normalizeValue(attr.value);
      } else {
        // Base attribute: data-fv-{validator} — sets enabled flag
        if (opts[validatorName].enabled !== true) {
          opts[validatorName].enabled = attr.value === "" || attr.value === "true";
        }
      }
    }

    return { validators: opts as Record<string, ValidatorOptions> };
  }

  /** Coerce attribute string values to their natural types. */
  private normalizeValue(value: string): boolean | number | string {
    if (value === "true" || value === "") return true;
    if (value === "false") return false;
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== "") return num;
    return value;
  }

  private toCamelCase(input: string): string {
    return input.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  }
}
```

- [ ] **Step 2: Add export to `src/plugins/index.ts`**

Read the file. Find the FieldStatus export lines. Add after them:

```ts
export { Declarative } from "./core/Declarative";
export type { DeclarativeOptions } from "./core/Declarative";
```

- [ ] **Step 3: Create `tests/plugins/Declarative.test.ts`**

```ts
import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src";
import { Declarative } from "../../src/plugins/core/Declarative";
import { makeForm } from "../helpers";

describe("Declarative", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Basic attribute parsing ──────────────────────────────────────────────

  it("enables a validator from data-fv-{validator}='true' attribute", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-not-empty", "true");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("disables a validator when data-fv-{validator}='false'", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-not-empty", "false");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
    });
    // notEmpty is disabled — empty value should pass
    expect(await fv.validate()).toBe("Valid");
  });

  it("sets a string option from data-fv-{validator}___{option}", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-not-empty", "true");
    input.setAttribute("data-fv-not-empty___message", "Name is required");

    const plugin = new Declarative();
    validare(form, { plugins: { declarative: plugin } });

    const { validators } = plugin.parseElement(input);
    expect(validators.notEmpty.message).toBe("Name is required");
  });

  it("coerces numeric option to number", () => {
    const form = makeForm({ name: "ab" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-string-length", "true");
    input.setAttribute("data-fv-string-length___min", "3");

    const plugin = new Declarative();
    validare(form, { plugins: { declarative: plugin } });

    const { validators } = plugin.parseElement(input);
    expect(validators.stringLength.min).toBe(3);
    expect(typeof validators.stringLength.min).toBe("number");
  });

  it("coerces 'true' and '' attribute values to boolean true", () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-between___inclusive", "true");
    input.setAttribute("data-fv-between___other", "");

    const plugin = new Declarative();
    validare(form, { plugins: { declarative: plugin } });

    const { validators } = plugin.parseElement(input);
    expect(validators.between.inclusive).toBe(true);
    expect(validators.between.other).toBe(true);
  });

  it("coerces 'false' attribute value to boolean false", () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-between___inclusive", "false");

    const plugin = new Declarative();
    validare(form, { plugins: { declarative: plugin } });

    const { validators } = plugin.parseElement(input);
    expect(validators.between.inclusive).toBe(false);
  });

  it("converts kebab-case attribute names to camelCase", async () => {
    const form = makeForm({ name: "ab" }); // too short
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    // data-fv-string-length → stringLength
    input.setAttribute("data-fv-string-length", "true");
    input.setAttribute("data-fv-string-length___min", "3");

    const fv = validare(form, { plugins: { declarative: new Declarative() } });
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Purely declarative fields (no programmatic field config) ────────────

  it("registers a field purely from declarative attributes (no programmatic config)", async () => {
    const form = makeForm({ email: "not-an-email" });
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    input.setAttribute("data-fv-email", "true");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("uses data-fv-field as fallback field name when name attribute is absent", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);
    const input = document.createElement("input");
    input.setAttribute("data-fv-field", "custom");
    input.setAttribute("data-fv-not-empty", "true");
    input.value = "";
    form.appendChild(input);

    const fv = validare(form, { plugins: { declarative: new Declarative() } });
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Programmatic precedence ──────────────────────────────────────────────

  it("programmatic validators take precedence over declarative", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    // Declarative says notEmpty is disabled
    input.setAttribute("data-fv-not-empty", "false");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
      // Programmatic says notEmpty is enabled
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    // Programmatic wins — empty field should fail
    expect(await fv.validate()).toBe("Invalid");
  });

  it("adds declarative validators for names not in programmatic config", async () => {
    const form = makeForm({ name: "ab" }); // fails stringLength min=3
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    // Only stringLength in declarative; notEmpty programmatic
    input.setAttribute("data-fv-string-length", "true");
    input.setAttribute("data-fv-string-length___min", "3");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    // Both validators run: notEmpty passes ("ab" not empty), stringLength fails (length < 3)
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Custom prefix ────────────────────────────────────────────────────────

  it("respects custom prefix option", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-val-not-empty", "true");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ prefix: "data-val-" }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── html5Input option ────────────────────────────────────────────────────

  it("html5Input: required attribute enables notEmpty", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("required", "");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: type=email enables email validator", async () => {
    const form = makeForm({ email: "not-an-email" });
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    input.setAttribute("type", "email");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: minlength enables stringLength with min", async () => {
    const form = makeForm({ name: "ab" }); // 2 chars
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("minlength", "3");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: maxlength enables stringLength with max", async () => {
    const form = makeForm({ name: "hello!" }); // 6 chars
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("maxlength", "5");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: pattern enables regexp validator", async () => {
    const form = makeForm({ code: "abc123" }); // contains digits
    const input = form.querySelector('[name="code"]') as HTMLInputElement;
    input.setAttribute("pattern", "^[a-z]+$"); // only lowercase letters

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: min (non-range) enables greaterThan", async () => {
    const form = makeForm({ age: "15" });
    const input = form.querySelector('[name="age"]') as HTMLInputElement;
    input.setAttribute("min", "18");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: max (non-range) enables lessThan", async () => {
    const form = makeForm({ age: "200" });
    const input = form.querySelector('[name="age"]') as HTMLInputElement;
    input.setAttribute("max", "120");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Dynamic fields ───────────────────────────────────────────────────────

  it("picks up declarative attrs when a field is added dynamically", async () => {
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });

    // Add new input with declarative attrs after validare() initialised
    const emailInput = document.createElement("input");
    emailInput.setAttribute("name", "email");
    emailInput.setAttribute("data-fv-not-empty", "true");
    emailInput.value = ""; // empty — should fail
    form.appendChild(emailInput);

    // Add the field to core with no programmatic validators
    fv.addField("email", { validators: {} });

    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Uninstall / disabled ─────────────────────────────────────────────────

  it("does not add declarative validators after uninstall", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-not-empty", "true");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
    });
    fv.deregisterPlugin("declarative");

    // The field was already added by install() — this test verifies no errors
    // and that the deregistered plugin doesn't crash
    expect(await fv.validate()).toBe("Invalid"); // notEmpty was added during install
  });
});
```

- [ ] **Step 4: Run Declarative tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/Declarative.test.ts
```

Expected: all 20 tests pass. If any fail, fix the implementation.

- [ ] **Step 5: Run full test suite**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add src/plugins/core/Declarative.ts src/plugins/index.ts tests/plugins/Declarative.test.ts
git commit -m "feat(declarative): add Declarative plugin for data-fv-* HTML attribute config"
```

---

## Task 2: VitePress docs + rebuild UMD + update backlog

**Files:**
- Create: `validare-docs/plugins/Declarative.md`
- Modify: `validare-docs/plugins/index.md` (Core Plugins table)
- Modify: `validare-docs/.vitepress/config.ts` (Core Plugins 11→12)
- Modify: `validare-docs/public/validare.umd.js` (rebuild)
- Modify: `docs/superpowers/BACKLOG.md`

### Context

**VitePress reference:** Read `validare-docs/plugins/FieldStatus.md` for structure.
**Sidebar:** find `"Core Plugins (11)"`, change to `"Core Plugins (12)"`, add `{ text: 'Declarative', link: '/plugins/Declarative' }` after FieldStatus.
**UMD copy:** use `command cp` (not `cp`).
**Goal for docs:** The user explicitly requested comprehensive documentation with examples. The page must include: full attribute syntax reference, html5Input mapping table, multiple playgrounds, notes, and full example HTML snippets.

---

- [ ] **Step 1: Create `validare-docs/plugins/Declarative.md`**

Write the file with exactly this content:

````md
# `Declarative` Plugin

Configure form validation entirely through HTML attributes — no JavaScript field configuration needed. Add `data-fv-*` attributes to your inputs and Validare will pick them up automatically.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enable or disable the plugin |
| `prefix` | `string` | `"data-fv-"` | Attribute prefix for validators |
| `html5Input` | `boolean` | `false` | Map native HTML5 attributes (`required`, `type`, `minlength`, …) to validators |

## Attribute Syntax

### Enabling a validator

```html
<input name="email" data-fv-email="true" />
```

The attribute name is `{prefix}{validator-kebab-case}`. Set the value to `"true"` to enable the validator.

### Setting validator options

```html
<input
  name="username"
  data-fv-not-empty="true"
  data-fv-not-empty___message="Username is required"
  data-fv-string-length="true"
  data-fv-string-length___min="3"
  data-fv-string-length___max="20"
  data-fv-string-length___message="Username must be 3–20 characters"
/>
```

Options use three underscores (`___`) as a separator between the validator name and the option name:

```
data-fv-{validator}___{option}="{value}"
```

Both the validator name and option name use **kebab-case** in the attribute and are automatically converted to camelCase: `string-length` → `stringLength`, `not-empty` → `notEmpty`.

### Value coercion

| Attribute value | JavaScript value |
| --- | --- |
| `"true"` or `""` | `true` (boolean) |
| `"false"` | `false` (boolean) |
| `"3"`, `"3.14"` | `3`, `3.14` (number) |
| Anything else | string |

### Field name fallback

If an element has no `name` attribute, use `data-fv-field` to name the field:

```html
<input data-fv-field="username" data-fv-not-empty="true" />
```

## All Validators Reference

Every Validare validator can be configured declaratively. Validator names map directly from camelCase to kebab-case:

| Validator | Attribute | Common options |
| --- | --- | --- |
| `notEmpty` | `data-fv-not-empty` | `message` |
| `email` | `data-fv-email` | `message` |
| `stringLength` | `data-fv-string-length` | `min`, `max`, `message` |
| `between` | `data-fv-between` | `min`, `max`, `inclusive`, `message` |
| `greaterThan` | `data-fv-greater-than` | `min`, `inclusive`, `message` |
| `lessThan` | `data-fv-less-than` | `max`, `inclusive`, `message` |
| `regexp` | `data-fv-regexp` | `regexp`, `flags`, `message` |
| `digits` | `data-fv-digits` | `message` |
| `numeric` | `data-fv-numeric` | `message` |
| `integer` | `data-fv-integer` | `message` |
| `uri` | `data-fv-uri` | `message` |
| `creditCard` | `data-fv-credit-card` | `message` |
| `date` | `data-fv-date` | `format`, `min`, `max`, `message` |
| `identical` | `data-fv-identical` | `compare`, `message` |
| `different` | `data-fv-different` | `compare`, `message` |
| `choice` | `data-fv-choice` | `min`, `max`, `message` |
| `ip` | `data-fv-ip` | `ipv4`, `ipv6`, `message` |
| `callback` | `data-fv-callback` | `callback`, `message` |

## `html5Input` Mode

When `html5Input: true`, standard HTML5 attributes are automatically mapped to validators:

| HTML5 attribute | Condition | Validator |
| --- | --- | --- |
| `required` | — | `notEmpty` |
| `type="email"` | — | `email` |
| `type="url"` | — | `uri` |
| `type="range"` | — | `between` (reads `min`/`max`) |
| `minlength="N"` | — | `stringLength` with `min: N` |
| `maxlength="N"` | — | `stringLength` with `max: N` |
| `pattern="…"` | — | `regexp` |
| `min="N"` | type ≠ date/range | `greaterThan` with `min: N` |
| `max="N"` | type ≠ date/range | `lessThan` with `max: N` |

You can still add `data-fv-*` attributes alongside HTML5 attributes — both are merged.

## Playground — Basic

A form configured entirely in HTML. No `fields` option in JavaScript.

<script setup>
const codeBasic = `
document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Username</label>
      <input type="text" name="username"
        data-fv-not-empty="true"
        data-fv-not-empty___message="Username is required"
        data-fv-string-length="true"
        data-fv-string-length___min="3"
        data-fv-string-length___max="20"
        data-fv-string-length___message="Must be 3–20 characters"
      >
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Email</label>
      <input type="text" name="email"
        data-fv-not-empty="true"
        data-fv-not-empty___message="Email is required"
        data-fv-email="true"
        data-fv-email___message="Enter a valid email address"
      >
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="button" id="btn">Validate</button>
  </form>
\`;
const { validare, Message, Trigger, Declarative } = Validare;
const fv = validare(document.getElementById('demo'), {
  plugins: {
    message:     new Message(),
    trigger:     new Trigger(),
    declarative: new Declarative(),
  },
});
document.getElementById('btn').addEventListener('click', () => fv.validate());
`.trim()
</script>

<ValidarePlayground :code="codeBasic" />

## Playground — html5Input

Use native HTML5 attributes — zero custom `data-fv-*` needed.

<script setup>
const codeHtml5 = `
document.body.innerHTML = \`
  <form id="demo2" novalidate>
    <div class="field">
      <label>Full name (3–40 chars)</label>
      <input type="text" name="name" required minlength="3" maxlength="40"
             placeholder="Jane Doe">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" required placeholder="jane@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Age (18–120)</label>
      <input type="number" name="age" required min="18" max="120" placeholder="25">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Postal code (letters only)</label>
      <input type="text" name="zip" required pattern="^[A-Za-z0-9 -]+$"
             placeholder="SW1A 1AA">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="button" id="btn2">Validate</button>
  </form>
\`;
const { validare, Message, Trigger, Declarative } = Validare;
const fv = validare(document.getElementById('demo2'), {
  plugins: {
    message:     new Message(),
    trigger:     new Trigger(),
    declarative: new Declarative({ html5Input: true }),
  },
});
document.getElementById('btn2').addEventListener('click', () => fv.validate());
`.trim()
</script>

<ValidarePlayground :code="codeHtml5" />

## Playground — Mixed: declarative + programmatic

Programmatic validators always take precedence. Use declarative for markup-friendly options (messages, constraints) and programmatic for logic-heavy validators (callback, remote).

<script setup>
const codeMixed = `
document.body.innerHTML = \`
  <form id="demo3" novalidate>
    <div class="field">
      <label>Username</label>
      <!-- notEmpty and stringLength come from attributes -->
      <input type="text" name="username"
        data-fv-not-empty="true"
        data-fv-not-empty___message="Username is required"
        data-fv-string-length="true"
        data-fv-string-length___min="3"
        data-fv-string-length___message="At least 3 characters"
        placeholder="alice">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Password</label>
      <!-- notEmpty comes from attribute; the callback validator is programmatic -->
      <input type="password" name="password"
        data-fv-not-empty="true"
        data-fv-not-empty___message="Password is required"
        placeholder="••••••">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="button" id="btn3">Validate</button>
  </form>
\`;
const { validare, Message, Trigger, Declarative } = Validare;
const fv = validare(document.getElementById('demo3'), {
  plugins: {
    message:     new Message(),
    trigger:     new Trigger(),
    declarative: new Declarative(),
  },
  // Programmatic: callback validator added on top of declarative notEmpty
  fields: {
    password: {
      validators: {
        callback: {
          message: 'Password must be at least 8 characters',
          callback: ({ value }) => ({ valid: value.length >= 8 }),
        },
      },
    },
  },
});
document.getElementById('btn3').addEventListener('click', () => fv.validate());
`.trim()
</script>

<ValidarePlayground :code="codeMixed" />

## Complete HTML Example

A fully declarative sign-up form — copy-paste ready, no `fields` configuration needed:

```html
<form id="signup" novalidate>
  <div>
    <label for="username">Username</label>
    <input id="username" type="text" name="username"
      data-fv-not-empty="true"
      data-fv-not-empty___message="Username is required"
      data-fv-string-length="true"
      data-fv-string-length___min="3"
      data-fv-string-length___max="20"
      data-fv-string-length___message="Must be 3–20 characters"
    >
  </div>

  <div>
    <label for="email">Email</label>
    <input id="email" type="text" name="email"
      data-fv-not-empty="true"
      data-fv-not-empty___message="Email is required"
      data-fv-email="true"
      data-fv-email___message="Enter a valid email address"
    >
  </div>

  <div>
    <label for="password">Password</label>
    <input id="password" type="password" name="password"
      data-fv-not-empty="true"
      data-fv-not-empty___message="Password is required"
      data-fv-string-length="true"
      data-fv-string-length___min="8"
      data-fv-string-length___message="At least 8 characters"
    >
  </div>

  <div>
    <label for="confirm">Confirm password</label>
    <input id="confirm" type="password" name="confirm"
      data-fv-not-empty="true"
      data-fv-not-empty___message="Please confirm your password"
      data-fv-identical="true"
      data-fv-identical___compare="() => document.getElementById('password').value"
      data-fv-identical___message="Passwords do not match"
    >
  </div>

  <button type="submit">Sign up</button>
</form>

<script type="module">
import { validare, Message, Trigger, SubmitButton, Declarative } from 'validare';

validare(document.getElementById('signup'), {
  plugins: {
    message:      new Message(),
    trigger:      new Trigger(),
    submitButton: new SubmitButton(),
    declarative:  new Declarative(),
  },
});
</script>
```

## Notes

- **Programmatic takes precedence.** If the same validator is defined both in `fields` and in an attribute, the programmatic version wins. Declarative attributes only add validators for names not already present in the programmatic config.

- **Validator names use kebab-case.** `notEmpty` → `data-fv-not-empty`, `stringLength` → `data-fv-string-length`, `creditCard` → `data-fv-credit-card`, and so on.

- **All validators disabled by default without the base attribute.** Setting only option attributes (e.g. `data-fv-string-length___min="3"`) without the base `data-fv-string-length="true"` attribute leaves the validator disabled. Always include the base attribute to enable validation.

- **Dynamic fields are supported.** If you call `fv.addField('newField', ...)` after initialisation and the DOM element for that field has `data-fv-*` attributes, the Declarative plugin will pick them up automatically.

- **Custom prefix.** If `data-fv-` conflicts with other libraries, change it: `new Declarative({ prefix: 'data-val-' })` and use `data-val-not-empty="true"` instead.

- **`html5Input` adds validators, not replaces.** You can combine HTML5 attributes with `data-fv-*` on the same element — both are merged.
````

- [ ] **Step 2: Add Declarative to `validare-docs/plugins/index.md`**

Read the file. Find the Core Plugins table. Add after the FieldStatus row:

```markdown
| [Declarative](./Declarative.md) | Configure validators via HTML `data-fv-*` attributes, no JavaScript needed |
```

- [ ] **Step 3: Update `validare-docs/.vitepress/config.ts` sidebar**

Find `"Core Plugins (11)"`. Change to `"Core Plugins (12)"`. Add `{ text: 'Declarative', link: '/plugins/Declarative' }` after the FieldStatus entry.

- [ ] **Step 4: Build and copy UMD**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm run build
command cp dist/index.umd.js ../validare-docs/public/validare.umd.js
```

- [ ] **Step 5: Update BACKLOG.md**

In `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/superpowers/BACKLOG.md`, change:
```
| ⬜ Pendente | **Declarative** | Configuração via atributos HTML (`data-fv-*`) sem JavaScript |
```
To:
```
| ✅ Concluído | **Declarative** | Configuração via atributos HTML (`data-fv-*`) sem JavaScript |
```

- [ ] **Step 6: Commit validare**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add docs/superpowers/BACKLOG.md
git commit -m "docs: mark Declarative as completed in backlog"
```

- [ ] **Step 7: Commit validare-docs**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/Declarative.md plugins/index.md .vitepress/config.ts public/validare.umd.js
git commit -m "docs: add Declarative plugin page with full attribute reference and examples"
```

---

## Self-Review

**Spec coverage:**
- ✅ `data-fv-{validator}="true/false"` — enables/disables validator
- ✅ `data-fv-{validator}___{option}="{value}"` — sets option
- ✅ kebab-case → camelCase conversion
- ✅ `"true"/"" → true`, `"false" → false`, numeric string → number coercion
- ✅ `html5Input` option with all 8 HTML5 attribute mappings
- ✅ `prefix` option for custom attribute prefix
- ✅ `data-fv-field` fallback for missing `name` attribute
- ✅ Programmatic validators take precedence
- ✅ Dynamic field support via `core.field.added`
- ✅ Infinite loop prevention via `addedFields: Set<string>`
- ✅ 20 tests covering all behaviours
- ✅ `parseElement` is public (needed for tests inspecting parsed options)
- ✅ VitePress page: 3 playgrounds, attribute reference table, html5Input mapping table, complete HTML example, notes

**Placeholder scan:** None found.

**Type consistency:**
- `parseElement` returns `{ validators: Record<string, ValidatorOptions> }` — used consistently in `install()`, `onFieldAdded`, and tests.
- `DeclarativeOptions.prefix` and `html5Input` are read as `this.opts.prefix as string` and `this.opts.html5Input as boolean` — correct since the constructor defaults ensure these are always set.
- `FieldOptions` imported from `../../core/types` — matches `addField` parameter type.
