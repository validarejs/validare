# PasswordStrength Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `PasswordStrength` plugin that validates password strength using a built-in scoring algorithm (no external dependencies) and fires an `onScore` callback so the user can show a strength indicator.

**Architecture:** The plugin registers a unique custom validator factory per instance (using a random `_id` to avoid collisions) and adds it to the specified field in `install()`. The validator scores passwords 0–4 based on length, uppercase, digits, and special characters. An `onScore` callback fires after each evaluation. Cleanup in `uninstall()` removes the validator from the field and deregisters the factory. No DOM changes by the plugin itself — the user uses `onScore` to update their UI.

**Tech Stack:** TypeScript, Vitest, JSDOM, existing validare plugin/validator pattern.

---

## Score Algorithm

```
score = 0
+1 if length >= 8
+1 if has uppercase letter [A-Z]
+1 if has digit [0-9]
+1 if has special character [^A-Za-z0-9]
```

Score examples:
| Password | Score | Reason |
|---|---|---|
| `""` | 0 | Empty |
| `"abc"` | 0 | Too short, no other criteria |
| `"abcdefgh"` | 1 | Length only |
| `"Abcdefgh"` | 2 | Length + uppercase |
| `"Abcdefg1"` | 3 | Length + uppercase + digit |
| `"Abcdefg1!"` | 4 | All criteria met |

---

## File Map

```
src/plugins/core/PasswordStrength.ts       ← new plugin + validator
src/plugins/index.ts                       ← add export
tests/plugins/PasswordStrength.test.ts     ← new test file
validare-docs/plugins/PasswordStrength.md  ← new VitePress page
validare-docs/plugins/index.md             ← add to Utility Plugins table
validare-docs/.vitepress/config.ts         ← update sidebar Utility Plugins count
validare-docs/public/validare.umd.js       ← rebuild UMD
docs/superpowers/BACKLOG.md                ← mark PasswordStrength as ✅
```

Note: PasswordStrength goes in the **Utility Plugins** section (not Core Plugins) because it targets a specific field and has a domain-specific purpose like Dependency/StartEndDate/Transformer.

---

## Task 1: Implement PasswordStrength plugin + tests

**Files:**
- Create: `src/plugins/core/PasswordStrength.ts`
- Modify: `src/plugins/index.ts`
- Create: `tests/plugins/PasswordStrength.test.ts`

### Context

**`core.registerValidator(name, factory)`** — registers a validator factory globally. Called in `install()`.

**`core.addField(field, options)`** — merges validators into an existing field (or creates new). Called in `install()` to add the strength validator to the target field.

**`core.removeValidator(field, validatorName)`** — removes a validator from a field. Called in `uninstall()`.

**`core.deregisterValidator(name)`** — removes the factory from the global registry. Called in `uninstall()`.

**`core.validator.validated` payload:**
```ts
{ field: string, validator: string, result: { valid: boolean, status: ValidationStatus, message: string } }
```
The original validator result also carries extra metadata. But in validare's Core, the `core.validator.validated` event only passes `{ ...result, status, message }`. To pass the score to `onScore`, we can either:
- Call `onScore` directly from the validator's `validate()` method (simplest)
- Or listen to `core.validator.validated` and reconstruct

**Chosen approach:** Call `onScore` directly inside the validator's `validate()` method (synchronous, no event listener needed for this).

**Validator registration format:**
```ts
const factory: ValidatorFactory = () => ({
  validate(input: ValidatorInput): ValidatorResult {
    // ...
    return { valid, message };
  }
});
core.registerValidator(name, factory);
```

**Import paths:**
```ts
import { Plugin } from "../../core/Plugin";
import type { ValidatorFactory, ValidatorInput, ValidatorResult } from "../../core/types";
```

Check `src/core/types.ts` to confirm `ValidatorFactory`, `ValidatorInput`, and `ValidatorResult` are exported there.

---

- [ ] **Step 1: Create `src/plugins/core/PasswordStrength.ts`**

```ts
import { Plugin } from "../../core/Plugin";
import type { ValidatorFactory, ValidatorInput } from "../../core/types";

export interface PasswordStrengthOptions {
  /** The field name to evaluate password strength for */
  field: string;
  /** Error message when score is below minScore. Default: 'The password is not strong enough' */
  message?: string;
  /** Minimum required score (0–4). Default: 3 */
  minScore?: number;
  /** Called after each evaluation */
  onScore?: (payload: { field: string; score: number; valid: boolean }) => void;
  [key: string]: unknown;
}

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export class PasswordStrength extends Plugin<PasswordStrengthOptions> {
  private readonly _id = Math.random().toString(36).slice(2, 8);
  private get validatorName(): string {
    return `__pwStr_${this._id}`;
  }

  private buildFactory(): ValidatorFactory {
    const field = this.opts.field;
    const minScore = this.opts.minScore ?? 3;
    const message = this.opts.message ?? "The password is not strong enough";
    const onScore = this.opts.onScore;

    return () => ({
      validate(input: ValidatorInput) {
        const score = scorePassword(input.value);
        const valid = score >= minScore;
        if (onScore) {
          onScore({ field, score, valid });
        }
        return { valid, message: valid ? "" : message };
      },
    });
  }

  install(): void {
    this.core.registerValidator(this.validatorName, this.buildFactory());
    this.core.addField(this.opts.field, {
      validators: {
        [this.validatorName]: { message: this.opts.message ?? "The password is not strong enough" },
      },
    });
  }

  uninstall(): void {
    this.core.removeValidator(this.opts.field, this.validatorName);
    this.core.deregisterValidator(this.validatorName);
  }
}
```

- [ ] **Step 2: Add export to `src/plugins/index.ts`**

Read the file. Find the AutoFocus export lines. Add after them:

```ts
export { PasswordStrength } from "./core/PasswordStrength";
export type { PasswordStrengthOptions } from "./core/PasswordStrength";
```

- [ ] **Step 3: Create `tests/plugins/PasswordStrength.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { validare } from "../../src";
import { PasswordStrength } from "../../src/plugins/core/PasswordStrength";
import { makeForm } from "../helpers";

describe("PasswordStrength", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("fails validation when password score is below minScore", async () => {
    const form = makeForm({ password: "abc" }); // score 0
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password" }) },
      fields: { password: { validators: {} } },
    });
    const result = await fv.validateField("password");
    expect(result).toBe("Invalid");
  });

  it("passes validation when password score meets minScore", async () => {
    const form = makeForm({ password: "Abcdefg1" }); // score 3: length + upper + digit
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password" }) },
      fields: { password: { validators: {} } },
    });
    const result = await fv.validateField("password");
    expect(result).toBe("Valid");
  });

  it("uses custom minScore option", async () => {
    const form = makeForm({ password: "abcdefgh" }); // score 1: length only
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password", minScore: 1 }) },
      fields: { password: { validators: {} } },
    });
    const result = await fv.validateField("password");
    expect(result).toBe("Valid");
  });

  it("calls onScore callback with correct score and valid flag", async () => {
    const form = makeForm({ password: "Abcdefg1" }); // score 3
    const onScore = vi.fn();
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password", onScore }) },
      fields: { password: { validators: {} } },
    });
    await fv.validateField("password");
    expect(onScore).toHaveBeenCalledOnce();
    expect(onScore).toHaveBeenCalledWith({ field: "password", score: 3, valid: true });
  });

  it("returns score 0 for empty password", async () => {
    const form = makeForm({ password: "" });
    const onScore = vi.fn();
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password", onScore }) },
      fields: { password: { validators: {} } },
    });
    await fv.validateField("password");
    expect(onScore).toHaveBeenCalledWith({ field: "password", score: 0, valid: false });
  });

  it("scores all 4 criteria for a strong password", async () => {
    const form = makeForm({ password: "Abcdefg1!" }); // score 4
    const onScore = vi.fn();
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password", onScore }) },
      fields: { password: { validators: {} } },
    });
    await fv.validateField("password");
    expect(onScore).toHaveBeenCalledWith({ field: "password", score: 4, valid: true });
  });

  it("uses custom error message", async () => {
    const form = makeForm({ password: "abc" });
    const fv = validare(form, {
      plugins: {
        pwStrength: new PasswordStrength({
          field: "password",
          message: "Too weak!",
        }),
      },
      fields: { password: { validators: {} } },
    });
    let errorMessage = "";
    fv.on("core.element.validated", (payload) => {
      const p = payload as import("../../src/core/types").ElementValidatedPayload;
      for (const result of Object.values(p.validators)) {
        if (!result.valid && result.message) errorMessage = result.message;
      }
    });
    await fv.validateField("password");
    expect(errorMessage).toBe("Too weak!");
  });

  it("two instances on different fields do not conflict", async () => {
    const form = makeForm({ password: "abc", confirm: "Abcdefg1" });
    const onScore1 = vi.fn();
    const onScore2 = vi.fn();
    const fv = validare(form, {
      plugins: {
        pwStr1: new PasswordStrength({ field: "password", onScore: onScore1 }),
        pwStr2: new PasswordStrength({ field: "confirm", onScore: onScore2 }),
      },
      fields: {
        password: { validators: {} },
        confirm:  { validators: {} },
      },
    });
    await fv.validate();
    expect(onScore1).toHaveBeenCalledWith(expect.objectContaining({ field: "password", score: 0 }));
    expect(onScore2).toHaveBeenCalledWith(expect.objectContaining({ field: "confirm", score: 3 }));
  });

  it("uninstall removes the strength validator from the field", async () => {
    const form = makeForm({ password: "abc" });
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password" }) },
      fields: { password: { validators: {} } },
    });
    fv.deregisterPlugin("pwStrength");
    fv.resetField("password");
    // After uninstall, the strength validator is gone — field has no validators → NotValidated
    const result = await fv.validateField("password");
    expect(result).toBe("NotValidated");
  });
});
```

- [ ] **Step 4: Run PasswordStrength tests**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm test -- tests/plugins/PasswordStrength.test.ts
```

Expected: 9 tests pass. If any fail, fix the implementation.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add src/plugins/core/PasswordStrength.ts src/plugins/index.ts tests/plugins/PasswordStrength.test.ts
git commit -m "feat(password-strength): add PasswordStrength plugin with built-in 0-4 scoring"
```

---

## Task 2: VitePress docs + rebuild UMD + update backlog

**Files:**
- Create: `validare-docs/plugins/PasswordStrength.md`
- Modify: `validare-docs/plugins/index.md` (Utility Plugins table)
- Modify: `validare-docs/.vitepress/config.ts` (Utility Plugins count 3→4)
- Modify: `validare-docs/public/validare.umd.js` (rebuild)
- Modify: `validare/docs/superpowers/BACKLOG.md`

### Context

**VitePress page structure:** Read `validare-docs/plugins/Transformer.md` — it's in the Utility Plugins section and is a good structural reference.

**`plugins/index.md` Utility Plugins table** — currently has 3 rows (Dependency, StartEndDate, Transformer). Add PasswordStrength.

**`.vitepress/config.ts` sidebar** — find `"Utility Plugins (3)"`, change to `"Utility Plugins (4)"`, add `{ text: 'PasswordStrength', link: '/plugins/PasswordStrength' }`.

**UMD copy:** use `command cp` (not `cp`).

---

- [ ] **Step 1: Create `validare-docs/plugins/PasswordStrength.md`**

```md
# `PasswordStrength` Plugin

Evaluates password strength on a 0–4 scale and validates against a minimum score threshold.

## Score Algorithm

| Score | Criteria met |
| --- | --- |
| 0 | None (empty or very short) |
| 1 | Length ≥ 8 |
| 2 | + Uppercase letter |
| 3 | + Digit |
| 4 | + Special character |

Each criterion adds 1 point. A password with all four criteria scores 4.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | `string` | *(required)* | The field name to evaluate |
| `message` | `string` | `'The password is not strong enough'` | Error message when score is below `minScore` |
| `minScore` | `number` | `3` | Minimum required score (0–4) |
| `onScore` | `function` | `undefined` | Called after each evaluation: `({ field, score, valid }) => void` |

## Playground

Type a password and click Validate to see the strength score. The indicator below the field updates in real time via the `onScore` callback.

<script setup>
const code = `
document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Password</label>
      <input type="password" name="password" placeholder="Enter a password" autocomplete="new-password">
      <div class="fv-plugins-message-container"></div>
      <div id="strength-bar" style="margin-top:6px;height:6px;border-radius:3px;background:#eee;overflow:hidden">
        <div id="strength-fill" style="height:100%;width:0;transition:width 0.3s,background 0.3s"></div>
      </div>
      <p id="strength-label" style="margin:4px 0 0;font-size:12px;color:#888"></p>
    </div>
    <button type="button" id="btn">Validate</button>
  </form>
\`;
const { validare, Message, PasswordStrength } = Validare;
const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const colors = ['#ef4444','#f97316','#eab308','#22c55e','#16a34a'];
const fv = validare(document.getElementById('demo'), {
  fields: {
    password: { validators: {} },
  },
  plugins: {
    message: new Message(),
    pwStrength: new PasswordStrength({
      field: 'password',
      minScore: 3,
      onScore: ({ score }) => {
        const fill = document.getElementById('strength-fill');
        const label = document.getElementById('strength-label');
        fill.style.width = (score * 25) + '%';
        fill.style.background = colors[score];
        label.textContent = labels[score];
        label.style.color = colors[score];
      },
    }),
  },
});
document.getElementById('btn').addEventListener('click', () => fv.validate());
`.trim()
</script>

<ValidarePlayground :code="code" />

## Notes

- Adds a strength validator to the specified `field` at plugin install time — the field must already exist in `fields`.
- Score is computed each time the field is validated (not on every keystroke unless `Trigger` is configured).
- Use `onScore` with the `Trigger` plugin (`event: 'input'`) for live feedback as the user types.
- Two `PasswordStrength` instances on different fields are fully independent.
- Removing the plugin (via `deregisterPlugin`) removes the strength validator from the field.
```

- [ ] **Step 2: Add PasswordStrength to `validare-docs/plugins/index.md`**

Read the file. Find the Utility Plugins table (has Dependency, StartEndDate, Transformer rows). Add:

```markdown
| [PasswordStrength](./PasswordStrength.md) | Evaluates password strength with a 0–4 score and minimum threshold |
```

- [ ] **Step 3: Update `validare-docs/.vitepress/config.ts` sidebar**

Find `"Utility Plugins (3)"`. Change to `"Utility Plugins (4)"`. Add `{ text: 'PasswordStrength', link: '/plugins/PasswordStrength' }` at the end of the Utility Plugins items.

- [ ] **Step 4: Build and copy UMD**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
npm run build
command cp dist/index.umd.js ../validare-docs/public/validare.umd.js
```

- [ ] **Step 5: Update BACKLOG.md**

Change:
```
| ⬜ Pendente | **PasswordStrength** | Avalia força de senha com score mínimo configurável |
```
To:
```
| ✅ Concluído | **PasswordStrength** | Avalia força de senha com score mínimo configurável |
```

- [ ] **Step 6: Commit validare**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add docs/superpowers/BACKLOG.md
git commit -m "docs: mark PasswordStrength as completed in backlog"
```

- [ ] **Step 7: Commit validare-docs**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/PasswordStrength.md plugins/index.md .vitepress/config.ts public/validare.umd.js
git commit -m "docs: add PasswordStrength plugin page, update sidebar to Utility Plugins (4)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Score 0–4 algorithm (length, uppercase, digit, special)
- ✅ `minScore` option (default 3)
- ✅ `message` option (custom error message)
- ✅ `onScore` callback with `{ field, score, valid }`
- ✅ Unique validator name per instance (avoids collisions)
- ✅ `install()` registers validator + adds to field
- ✅ `uninstall()` removes validator from field + deregisters factory
- ✅ Tests for all behaviors including two-instance isolation
- ✅ VitePress page with visual strength bar playground
- ✅ BACKLOG.md updated

**Placeholder scan:** None found.

**Type consistency:** `ValidatorFactory` and `ValidatorInput` imported from `../../core/types` — same path as all validators. `PasswordStrengthOptions` index signature `[key: string]: unknown` required by `Plugin<T extends Record<string, unknown>>`.
