# Docs & Examples: Dependency, StartEndDate, Transformer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Markdown docs pages and static HTML examples for the three new plugins (Dependency, StartEndDate, Transformer), and update the index files and VitePress sidebar to include them.

**Architecture:** Mirror the existing pattern exactly: each plugin gets one `.md` page in `validare-docs/plugins/` (with a live playground) and one `.html` file in `validare/examples/plugins/`. Index files in both locations need to reference the new plugins. The VitePress `config.ts` sidebar also needs three new entries.

**Tech Stack:** VitePress (Markdown + Vue SFCs), plain HTML examples, UMD bundle at `../../dist/index.umd.js` (examples) and `/validare.umd.js` (playground).

---

## File Map

```
validare-docs/plugins/Dependency.md          ← create: VitePress page with playground
validare-docs/plugins/StartEndDate.md        ← create: VitePress page with playground
validare-docs/plugins/Transformer.md         ← create: VitePress page with playground
validare-docs/plugins/index.md               ← modify: add 3 rows to the "Utility Plugins" table
validare-docs/.vitepress/config.ts           ← modify: add sidebar group "Utility Plugins (3)"

validare/examples/plugins/Dependency.html    ← create: static HTML example
validare/examples/plugins/StartEndDate.html  ← create: static HTML example
validare/examples/plugins/Transformer.html   ← create: static HTML example
validare/examples/plugins/index.html         ← modify: add links to the 3 new examples
```

---

## Task 1: Dependency plugin docs page + HTML example

**Files:**
- Create: `validare-docs/plugins/Dependency.md`
- Create: `validare/examples/plugins/Dependency.html`

### Context

**What Dependency does:** When a primary field validates, it automatically revalidates all fields listed as its dependents. Config: `{ primaryField: 'dep1 dep2' }` (space-separated). Anti-loop protection is built-in.

**Typical use case:** Country + postal code. When the country field changes and validates, the postal code is revalidated so the country-specific format rule runs again.

**Plugin import in playground:** `const { validare, Trigger, Message, Dependency } = Validare;`

**Plugin import in HTML example:** same destructuring from `Validare` global.

---

- [ ] **Step 1: Create the docs page**

Create `validare-docs/plugins/Dependency.md`:

```markdown
---
outline: deep
---

# `Dependency` Plugin

Automatically revalidates dependent fields when a primary field validates.

## Options

| Option | Type | Description |
|---|---|---|
| `[field]` | `string` | Space-separated list of dependent field names to revalidate when `field` validates |

## Playground

<script setup>
const code = `document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Country</label>
      <select name="country">
        <option value="">— select —</option>
        <option value="US">United States</option>
        <option value="BR">Brazil</option>
      </select>
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Postal Code (re-validates when country changes)</label>
      <input type="text" name="postal" placeholder="e.g. 90210 or 01310-100">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
\`;
const { validare, Trigger, Message, Dependency } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    country: { validators: { notEmpty: { message: 'Please select a country' } } },
    postal:  {
      validators: {
        notEmpty: { message: 'Postal code is required' },
        callback: {
          message: 'Invalid postal code for selected country',
          callback: ({ value, form }) => {
            const country = form.querySelector('[name="country"]').value;
            if (country === 'US') return /^\d{5}(-\d{4})?$/.test(value);
            if (country === 'BR') return /^\d{5}-?\d{3}$/.test(value);
            return value.length > 0;
          }
        }
      }
    }
  },
  plugins: {
    trigger:    new Trigger({ event: 'change' }),
    message:    new Message(),
    dependency: new Dependency({ country: 'postal' })
  }
});`
</script>

<ValidarePlayground :code="code" height="380px" />

## Notes

- Dependents are space-separated: `{ a: 'b c' }` revalidates both `b` and `c` when `a` validates.
- Built-in loop protection: if `a` depends on `b` and `b` depends on `a`, the chain stops after one full cycle.
- Works with any event — combine with `Trigger` to trigger the cascade on `change` or `input`.
```

- [ ] **Step 2: Create the HTML example**

Create `validare/examples/plugins/Dependency.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Validare — Dependency Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › Dependency</nav>
  <h1><code>Dependency</code> Plugin</h1>
  <p>Automatically revalidates dependent fields when a primary field validates. Here, changing the country re-runs postal code validation with the new country rule.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="country">Country</label>
      <select id="country" name="country">
        <option value="">— select —</option>
        <option value="US">United States</option>
        <option value="BR">Brazil</option>
      </select>
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label for="postal">Postal Code (re-validates when country changes)</label>
      <input type="text" id="postal" name="postal" placeholder="e.g. 90210 or 01310-100">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger, Dependency } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        country: { validators: { notEmpty: { message: 'Please select a country' } } },
        postal: {
          validators: {
            notEmpty: { message: 'Postal code is required' },
            callback: {
              message: 'Invalid postal code for selected country',
              callback: ({ value, form }) => {
                const country = form.querySelector('[name="country"]').value;
                if (country === 'US') return /^\d{5}(-\d{4})?$/.test(value);
                if (country === 'BR') return /^\d{5}-?\d{3}$/.test(value);
                return value.length > 0;
              }
            }
          }
        }
      },
      plugins: {
        trigger:    new Trigger({ event: 'change' }),
        message:    new Message(),
        dependency: new Dependency({ country: 'postal' })
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Verify HTML example works**

Open `validare/examples/plugins/Dependency.html` in a browser (or `open validare/examples/plugins/Dependency.html`).

Expected: selecting "United States" and typing `90210` should show valid; typing `01310-100` should show invalid; changing to "Brazil" should automatically re-validate postal with the new rule.

- [ ] **Step 4: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/Dependency.md
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add examples/plugins/Dependency.html
git commit -m "docs: add Dependency plugin page and example"
```

---

## Task 2: StartEndDate plugin docs page + HTML example

**Files:**
- Create: `validare-docs/plugins/StartEndDate.md`
- Create: `validare/examples/plugins/StartEndDate.html`

### Context

**What StartEndDate does:** Registers cross-field comparison validators on two date fields to ensure start ≤ end. Config has `format`, `startDate: { field, message }`, and `endDate: { field, message }`. Supported formats: `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY/MM/DD`. Cross-revalidation: when either date field validates, the other is automatically revalidated. Invalid calendar dates (e.g. Feb 30) are treated as unparseable → constraint deferred.

**Plugin import:** `const { validare, Trigger, Message, StartEndDate } = Validare;`

---

- [ ] **Step 1: Create the docs page**

Create `validare-docs/plugins/StartEndDate.md`:

```markdown
---
outline: deep
---

# `StartEndDate` Plugin

Ensures a start date field is on or before an end date field. Automatically cross-revalidates both fields when either changes.

## Options

| Option | Type | Description |
|---|---|---|
| `format` | `string` | Date format string. Supported tokens: `YYYY`, `MM`, `DD`. Separator: `-` or `/`. |
| `startDate.field` | `string` | Name of the start date field |
| `startDate.message` | `string` | Error message shown on the start field when start > end |
| `endDate.field` | `string` | Name of the end date field |
| `endDate.message` | `string` | Error message shown on the end field when end < start |

### Supported formats

| Format | Example |
|---|---|
| `YYYY-MM-DD` | `2025-12-31` |
| `DD/MM/YYYY` | `31/12/2025` |
| `MM/DD/YYYY` | `12/31/2025` |
| `YYYY/MM/DD` | `2025/12/31` |

## Playground

<script setup>
const code = `document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Check-in date</label>
      <input type="date" name="checkin">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Check-out date</label>
      <input type="date" name="checkout">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
\`;
const { validare, Trigger, Message, StartEndDate } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    checkin:  { validators: { notEmpty: { message: 'Check-in date is required' } } },
    checkout: { validators: { notEmpty: { message: 'Check-out date is required' } } }
  },
  plugins: {
    trigger:   new Trigger({ event: 'change' }),
    message:   new Message(),
    dateRange: new StartEndDate({
      format: 'YYYY-MM-DD',
      startDate: { field: 'checkin',  message: 'Check-in must be on or before check-out' },
      endDate:   { field: 'checkout', message: 'Check-out must be on or after check-in' }
    })
  }
});`
</script>

<ValidarePlayground :code="code" height="360px" />

## Notes

- Cross-revalidation is automatic: when either field changes and validates, the other is revalidated immediately.
- If either field is empty, the constraint is not applied (defers to `notEmpty` or `date` validators).
- Invalid calendar dates (e.g. February 30) are treated as unparseable — the cross-field constraint is skipped.
- Equal dates are valid (inclusive comparison: start ≤ end).
- Multiple `StartEndDate` instances on the same form are supported (each instance has a unique internal key).
```

- [ ] **Step 2: Create the HTML example**

Create `validare/examples/plugins/StartEndDate.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Validare — StartEndDate Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › StartEndDate</nav>
  <h1><code>StartEndDate</code> Plugin</h1>
  <p>Ensures a start date is on or before an end date. Both fields cross-revalidate automatically when either changes.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="checkin">Check-in date</label>
      <input type="date" id="checkin" name="checkin">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label for="checkout">Check-out date</label>
      <input type="date" id="checkout" name="checkout">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger, StartEndDate } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        checkin:  { validators: { notEmpty: { message: 'Check-in date is required' } } },
        checkout: { validators: { notEmpty: { message: 'Check-out date is required' } } }
      },
      plugins: {
        trigger:   new Trigger({ event: 'change' }),
        message:   new Message(),
        dateRange: new StartEndDate({
          format: 'YYYY-MM-DD',
          startDate: { field: 'checkin',  message: 'Check-in must be on or before check-out' },
          endDate:   { field: 'checkout', message: 'Check-out must be on or after check-in' }
        })
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/StartEndDate.md
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add examples/plugins/StartEndDate.html
git commit -m "docs: add StartEndDate plugin page and example"
```

---

## Task 3: Transformer plugin docs page + HTML example

**Files:**
- Create: `validare-docs/plugins/Transformer.md`
- Create: `validare/examples/plugins/Transformer.html`

### Context

**What Transformer does:** Intercepts the value passed to a specific validator via the `field-value` filter. Config: `{ fieldName: { validatorName: (field, element, validator) => string } }`. Other validators on the same field still see the raw value.

**Typical use cases:**
- Strip spaces/dashes from a credit card number before the `creditCard` validator
- Strip non-digits from a phone number before the `digits` validator
- Trim whitespace before `stringLength`

**Plugin import:** `const { validare, Trigger, Message, Transformer } = Validare;`

---

- [ ] **Step 1: Create the docs page**

Create `validare-docs/plugins/Transformer.md`:

```markdown
---
outline: deep
---

# `Transformer` Plugin

Transforms the value seen by a specific validator without modifying the actual input. Other validators on the same field receive the original value.

## Options

The options object is a nested map:

```ts
{
  [fieldName: string]: {
    [validatorName: string]: (field: string, element: HTMLElement, validator: string) => string
  }
}
```

Each transform function receives the field name, the DOM element, and the validator name, and returns the value string to use for that validator.

## Playground

<script setup>
const code = `document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Credit Card (spaces and dashes are stripped before validation)</label>
      <input type="text" name="cc" placeholder="4111 1111 1111 1111">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Phone (non-digits stripped before digits check)</label>
      <input type="text" name="phone" placeholder="(555) 123-4567">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
\`;
const { validare, Trigger, Message, Transformer } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    cc: {
      validators: {
        notEmpty:   { message: 'Card number is required' },
        creditCard: { message: 'Invalid card number' }
      }
    },
    phone: {
      validators: {
        notEmpty: { message: 'Phone is required' },
        digits:   { message: 'Phone must contain only digits' }
      }
    }
  },
  plugins: {
    trigger:     new Trigger({ event: 'blur' }),
    message:     new Message(),
    transformer: new Transformer({
      cc:    { creditCard: (_f, el) => el.value.replace(/[\s-]/g, '') },
      phone: { digits:    (_f, el) => el.value.replace(/\D/g, '') }
    })
  }
});`
</script>

<ValidarePlayground :code="code" height="400px" />

## Notes

- Only the specified validator sees the transformed value — `notEmpty` on the same field always sees the raw value.
- The transform function is called on every validation run; it does not modify the DOM.
- Disable the plugin with `fv.disablePlugin('transformer')` to revert to raw values.
- Works with the built-in `field-value` filter hook added to Core.
```

- [ ] **Step 2: Create the HTML example**

Create `validare/examples/plugins/Transformer.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Validare — Transformer Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › Transformer</nav>
  <h1><code>Transformer</code> Plugin</h1>
  <p>Transforms the value seen by a specific validator. Enter a card number with spaces (<code>4111 1111 1111 1111</code>) — the <code>creditCard</code> validator sees it without spaces.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="cc">Credit Card (spaces/dashes are stripped for validation)</label>
      <input type="text" id="cc" name="cc" placeholder="4111 1111 1111 1111">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label for="phone">Phone (non-digits stripped for validation)</label>
      <input type="text" id="phone" name="phone" placeholder="(555) 123-4567">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger, Transformer } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        cc: {
          validators: {
            notEmpty:   { message: 'Card number is required' },
            creditCard: { message: 'Invalid card number' }
          }
        },
        phone: {
          validators: {
            notEmpty: { message: 'Phone is required' },
            digits:   { message: 'Phone must contain only digits' }
          }
        }
      },
      plugins: {
        trigger:     new Trigger({ event: 'blur' }),
        message:     new Message(),
        transformer: new Transformer({
          cc:    { creditCard: (_f, el) => el.value.replace(/[\s-]/g, '') },
          phone: { digits:    (_f, el) => el.value.replace(/\D/g, '') }
        })
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/Transformer.md
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add examples/plugins/Transformer.html
git commit -m "docs: add Transformer plugin page and example"
```

---

## Task 4: Update index files and VitePress config

**Files:**
- Modify: `validare-docs/plugins/index.md`
- Modify: `validare-docs/.vitepress/config.ts`
- Modify: `validare/examples/plugins/index.html`

### Context

The `validare-docs/plugins/index.md` currently has two sections: "Core Plugins" and "CSS Framework Plugins". Add a new "Utility Plugins" section with the three new plugins.

The `validare-docs/.vitepress/config.ts` sidebar for `/plugins/` currently has two groups: "Core Plugins (6)" and "CSS Frameworks (3)". Add a third group "Utility Plugins (3)" with the three new entries.

The `validare/examples/plugins/index.html` currently has two `<ul class="links">` sections. Add a third one for "Utility Plugins".

---

- [ ] **Step 1: Update `validare-docs/plugins/index.md`**

Open the file. It currently ends after the CSS Frameworks table. Add a new section:

```markdown
## Utility Plugins

| Plugin | Description |
|---|---|
| [Dependency](/plugins/Dependency) | Revalidates dependent fields when a primary field validates |
| [StartEndDate](/plugins/StartEndDate) | Ensures start date ≤ end date across two fields |
| [Transformer](/plugins/Transformer) | Transforms the value seen by a specific validator |
```

The full file after the edit:

```markdown
# Plugins

Plugins extend the Validare core engine. Pass them in the `plugins` option map.

## Core Plugins

| Plugin | Description |
|---|---|
| [Trigger](/plugins/Trigger) | Validates on DOM events (`blur`, `input`, `change`) |
| [Message](/plugins/Message) | Displays error messages in the DOM |
| [Icon](/plugins/Icon) | Shows valid/invalid icons next to fields |
| [SubmitButton](/plugins/SubmitButton) | Disables the submit button during validation |
| [Excluded](/plugins/Excluded) | Skips disabled, hidden, or invisible fields |
| [Sequence](/plugins/Sequence) | Stops validation at the first failing validator per field |

## CSS Framework Plugins

| Plugin | Framework |
|---|---|
| [Bootstrap5](/plugins/Bootstrap5) | Applies Bootstrap 5 `is-valid` / `is-invalid` classes |
| [Bulma](/plugins/Bulma) | Applies Bulma `is-success` / `is-danger` classes |
| [Tailwind](/plugins/Tailwind) | Applies configurable Tailwind utility classes |

## Utility Plugins

| Plugin | Description |
|---|---|
| [Dependency](/plugins/Dependency) | Revalidates dependent fields when a primary field validates |
| [StartEndDate](/plugins/StartEndDate) | Ensures start date ≤ end date across two fields |
| [Transformer](/plugins/Transformer) | Transforms the value seen by a specific validator |
```

- [ ] **Step 2: Update `validare-docs/.vitepress/config.ts`**

Find the `/plugins/` sidebar section (around line 126). It currently has two groups. Add a third group after the CSS Frameworks group:

```ts
{
  text: 'Utility Plugins (3)',
  items: [
    { text: 'Dependency',   link: '/plugins/Dependency' },
    { text: 'StartEndDate', link: '/plugins/StartEndDate' },
    { text: 'Transformer',  link: '/plugins/Transformer' },
  ],
},
```

The full `/plugins/` sidebar block after the edit:

```ts
'/plugins/': [
  { text: 'All Plugins', link: '/plugins/' },
  {
    text: 'Core Plugins (6)',
    items: [
      { text: 'Trigger',      link: '/plugins/Trigger' },
      { text: 'Message',      link: '/plugins/Message' },
      { text: 'Icon',         link: '/plugins/Icon' },
      { text: 'SubmitButton', link: '/plugins/SubmitButton' },
      { text: 'Excluded',     link: '/plugins/Excluded' },
      { text: 'Sequence',     link: '/plugins/Sequence' },
    ],
  },
  {
    text: 'CSS Frameworks (3)',
    items: [
      { text: 'Bootstrap5', link: '/plugins/Bootstrap5' },
      { text: 'Bulma',      link: '/plugins/Bulma' },
      { text: 'Tailwind',   link: '/plugins/Tailwind' },
    ],
  },
  {
    text: 'Utility Plugins (3)',
    items: [
      { text: 'Dependency',   link: '/plugins/Dependency' },
      { text: 'StartEndDate', link: '/plugins/StartEndDate' },
      { text: 'Transformer',  link: '/plugins/Transformer' },
    ],
  },
],
```

- [ ] **Step 3: Update `validare/examples/plugins/index.html`**

Add a new section after the CSS Framework Plugins section. The full file after the edit:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Validare — Plugin Examples</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › Plugins</nav>
  <h1>Plugin Examples</h1>
  <h2>Core Plugins</h2>
  <ul class="links">
    <li><a href="Trigger.html">Trigger</a></li>
    <li><a href="Message.html">Message</a></li>
    <li><a href="Icon.html">Icon</a></li>
    <li><a href="SubmitButton.html">SubmitButton</a></li>
    <li><a href="Excluded.html">Excluded</a></li>
    <li><a href="Sequence.html">Sequence</a></li>
  </ul>
  <h2>CSS Framework Plugins</h2>
  <ul class="links">
    <li><a href="Bootstrap5.html">Bootstrap5</a></li>
    <li><a href="Bulma.html">Bulma</a></li>
    <li><a href="Tailwind.html">Tailwind</a></li>
  </ul>
  <h2>Utility Plugins</h2>
  <ul class="links">
    <li><a href="Dependency.html">Dependency</a></li>
    <li><a href="StartEndDate.html">StartEndDate</a></li>
    <li><a href="Transformer.html">Transformer</a></li>
  </ul>
</body>
</html>
```

- [ ] **Step 4: Commit**

```bash
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git add plugins/index.md .vitepress/config.ts
cd /Users/varantes/workspace/sandbox/jvalidation/validare
git add examples/plugins/index.html
git commit -m "docs: add Dependency, StartEndDate, Transformer to plugin indexes and sidebar"
```

---

## Self-Review

**Spec coverage:**
- ✅ Dependency: docs page, playground, HTML example, index entries, sidebar entry
- ✅ StartEndDate: docs page, playground, HTML example, index entries, sidebar entry
- ✅ Transformer: docs page, playground, HTML example, index entries, sidebar entry
- ✅ VitePress config.ts sidebar updated
- ✅ Both index files updated (validare-docs and validare/examples)

**Placeholder scan:**
- No TBDs, TODOs, or "similar to" references found
- All code blocks are complete and runnable

**Type consistency:**
- Playground and HTML examples use identical JS (same imports, same plugin config)
- `Dependency` options use `{ country: 'postal' }` notation consistently
- `StartEndDate` uses `format`, `startDate.field`, `startDate.message`, `endDate.field`, `endDate.message` consistently
- `Transformer` uses `{ fieldName: { validatorName: (_f, el) => ... } }` consistently
