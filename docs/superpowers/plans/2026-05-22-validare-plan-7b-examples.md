# Validare Plan 7b — HTML Examples

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one standalone HTML demo page for each of the 50 validators and 9 plugins, plus shared CSS and index pages.

**Architecture:** All pages are static HTML files that load `dist/index.umd.js` (UMD bundle, global `Validare`) and `examples/shared/style.css`. No server required. Plugin examples for CSS frameworks load from CDN.

**Tech Stack:** Vanilla HTML/JS, UMD bundle at `dist/index.umd.js`, Validare global (`const { validare, Message, Trigger, ... } = Validare`)

---

## File Structure

```
examples/
  shared/
    style.css                  ← shared base styles
  index.html                   ← top-level index: links to validators/ and plugins/
  validators/
    index.html                 ← index of all 50 validator examples
    notEmpty.html
    email.html
    creditCard.html
    date.html
    digits.html
    integer.html
    numeric.html
    regexp.html
    uri.html
    identical.html
    different.html
    between.html
    greaterThan.html
    lessThan.html
    stringLength.html
    stringCase.html
    choice.html
    file.html
    callback.html
    promise.html
    remote.html
    ip.html
    mac.html
    step.html
    base64.html
    hex.html
    color.html
    uuid.html
    bic.html
    iban.html
    vat.html
    cusip.html
    isin.html
    sedol.html
    grid.html
    ean.html
    isbn.html
    ismn.html
    issn.html
    imei.html
    imo.html
    meid.html
    vin.html
    ein.html
    rtn.html
    siren.html
    siret.html
    id.html
    phone.html
    zipCode.html
  plugins/
    index.html                 ← index of all 9 plugin examples
    Trigger.html
    Message.html
    Icon.html
    SubmitButton.html
    Excluded.html
    Sequence.html
    Bootstrap5.html
    Bulma.html
    Tailwind.html
```

---

## Standard Validator Page Template

Every `examples/validators/{name}.html` follows this template (deviations noted per task):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — {name}</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › {name}</nav>
  <h1><code>{name}</code></h1>
  <p>{description}</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">{Label}</label>
      <input type="{type}" id="val" name="val" placeholder="{placeholder}">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { {name}: { {options} } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

---

## Task 1: Shared CSS + Index Pages

**Files:**
- Create: `examples/shared/style.css`
- Create: `examples/index.html`
- Create: `examples/validators/index.html`
- Create: `examples/plugins/index.html`

- [ ] **Step 1: Create `examples/shared/style.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; color: #333; }
h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
h1 + p { margin-top: 0; color: #666; margin-bottom: 1.5rem; }
.field { margin-bottom: 1rem; }
label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
input[type="text"],
input[type="email"],
input[type="number"],
input[type="password"],
input[type="url"],
input[type="file"],
select,
textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
input.fv-valid, select.fv-valid { border-color: #28a745; }
input.fv-invalid, select.fv-invalid { border-color: #dc3545; }
.fv-plugins-message-container { color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; min-height: 1.25rem; }
button[type="submit"] { background: #0d6efd; color: #fff; border: none; padding: 0.5rem 1.25rem; border-radius: 4px; font-size: 1rem; cursor: pointer; }
button[type="submit"]:hover { background: #0b5ed7; }
button[type="submit"]:disabled { background: #6c757d; cursor: not-allowed; }
nav { margin-bottom: 1.5rem; font-size: 0.875rem; }
nav a { color: #0d6efd; text-decoration: none; }
nav a:hover { text-decoration: underline; }
ul.links { list-style: none; padding: 0; columns: 2; }
ul.links li { margin-bottom: 0.4rem; }
ul.links a { color: #0d6efd; text-decoration: none; font-family: monospace; }
ul.links a:hover { text-decoration: underline; }
h2 { margin-top: 1.5rem; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 0.25rem; }
```

- [ ] **Step 2: Create `examples/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare Examples</title>
  <link rel="stylesheet" href="shared/style.css">
</head>
<body>
  <h1>Validare Examples</h1>
  <p>Interactive demos for all validators and plugins.</p>
  <h2>Validators</h2>
  <p><a href="validators/index.html">Browse all 50 validator demos →</a></p>
  <h2>Plugins</h2>
  <p><a href="plugins/index.html">Browse all 9 plugin demos →</a></p>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Validator Examples</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › Validators</nav>
  <h1>Validator Examples</h1>
  <h2>Core</h2>
  <ul class="links">
    <li><a href="notEmpty.html">notEmpty</a></li>
    <li><a href="email.html">email</a></li>
    <li><a href="creditCard.html">creditCard</a></li>
    <li><a href="date.html">date</a></li>
    <li><a href="digits.html">digits</a></li>
    <li><a href="integer.html">integer</a></li>
    <li><a href="numeric.html">numeric</a></li>
    <li><a href="regexp.html">regexp</a></li>
    <li><a href="uri.html">uri</a></li>
    <li><a href="identical.html">identical</a></li>
    <li><a href="different.html">different</a></li>
    <li><a href="between.html">between</a></li>
    <li><a href="greaterThan.html">greaterThan</a></li>
    <li><a href="lessThan.html">lessThan</a></li>
    <li><a href="stringLength.html">stringLength</a></li>
    <li><a href="stringCase.html">stringCase</a></li>
    <li><a href="choice.html">choice</a></li>
    <li><a href="file.html">file</a></li>
    <li><a href="callback.html">callback</a></li>
    <li><a href="promise.html">promise</a></li>
    <li><a href="remote.html">remote</a></li>
    <li><a href="ip.html">ip</a></li>
  </ul>
  <h2>Format &amp; Encoding</h2>
  <ul class="links">
    <li><a href="mac.html">mac</a></li>
    <li><a href="step.html">step</a></li>
    <li><a href="base64.html">base64</a></li>
    <li><a href="hex.html">hex</a></li>
    <li><a href="color.html">color</a></li>
    <li><a href="uuid.html">uuid</a></li>
    <li><a href="bic.html">bic</a></li>
  </ul>
  <h2>Financial</h2>
  <ul class="links">
    <li><a href="iban.html">iban</a></li>
    <li><a href="vat.html">vat</a></li>
    <li><a href="cusip.html">cusip</a></li>
    <li><a href="isin.html">isin</a></li>
    <li><a href="sedol.html">sedol</a></li>
    <li><a href="grid.html">grid</a></li>
  </ul>
  <h2>Publication</h2>
  <ul class="links">
    <li><a href="ean.html">ean</a></li>
    <li><a href="isbn.html">isbn</a></li>
    <li><a href="ismn.html">ismn</a></li>
    <li><a href="issn.html">issn</a></li>
  </ul>
  <h2>Device &amp; Vehicle</h2>
  <ul class="links">
    <li><a href="imei.html">imei</a></li>
    <li><a href="imo.html">imo</a></li>
    <li><a href="meid.html">meid</a></li>
    <li><a href="vin.html">vin</a></li>
  </ul>
  <h2>Tax &amp; Business</h2>
  <ul class="links">
    <li><a href="ein.html">ein</a></li>
    <li><a href="rtn.html">rtn</a></li>
    <li><a href="siren.html">siren</a></li>
    <li><a href="siret.html">siret</a></li>
  </ul>
  <h2>Identity &amp; Geographic</h2>
  <ul class="links">
    <li><a href="id.html">id</a></li>
    <li><a href="phone.html">phone</a></li>
    <li><a href="zipCode.html">zipCode</a></li>
  </ul>
</body>
</html>
```

- [ ] **Step 4: Create `examples/plugins/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
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
</body>
</html>
```

- [ ] **Step 5: Commit**

```bash
cd validare
git add examples/shared/style.css examples/index.html examples/validators/index.html examples/plugins/index.html
git commit -m "feat(examples): add shared CSS and index pages"
```

---

## Task 2: Core Validators — notEmpty, email, creditCard, date

**Files:** Create `examples/validators/notEmpty.html`, `email.html`, `creditCard.html`, `date.html`

- [ ] **Step 1: Create `examples/validators/notEmpty.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — notEmpty</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › notEmpty</nav>
  <h1><code>notEmpty</code></h1>
  <p>Validates that a field is not empty.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Value</label>
      <input type="text" id="val" name="val" placeholder="Enter any text">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { notEmpty: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/email.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — email</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › email</nav>
  <h1><code>email</code></h1>
  <p>Validates that a field contains a valid email address.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Email</label>
      <input type="email" id="val" name="val" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { email: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/creditCard.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — creditCard</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › creditCard</nav>
  <h1><code>creditCard</code></h1>
  <p>Validates that a field contains a valid credit card number (Luhn check).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Card Number</label>
      <input type="text" id="val" name="val" placeholder="4111111111111111">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { creditCard: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/date.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — date</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › date</nav>
  <h1><code>date</code></h1>
  <p>Validates that a field contains a valid date matching the given format.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Date (YYYY-MM-DD)</label>
      <input type="text" id="val" name="val" placeholder="2024-01-15">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { date: { format: 'YYYY-MM-DD' } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Commit**

```bash
git add examples/validators/notEmpty.html examples/validators/email.html examples/validators/creditCard.html examples/validators/date.html
git commit -m "feat(examples): add notEmpty, email, creditCard, date validator demos"
```

---

## Task 3: Core Validators — digits, integer, numeric, regexp, uri

**Files:** Create `examples/validators/digits.html`, `integer.html`, `numeric.html`, `regexp.html`, `uri.html`

- [ ] **Step 1: Create `examples/validators/digits.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — digits</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › digits</nav>
  <h1><code>digits</code></h1>
  <p>Validates that a field contains only digit characters (0–9).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Digits only</label>
      <input type="text" id="val" name="val" placeholder="12345">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { digits: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/integer.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — integer</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › integer</nav>
  <h1><code>integer</code></h1>
  <p>Validates that a field contains a whole integer (negative allowed).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Integer</label>
      <input type="text" id="val" name="val" placeholder="-42 or 100">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { integer: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/numeric.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — numeric</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › numeric</nav>
  <h1><code>numeric</code></h1>
  <p>Validates that a field contains a numeric value (decimals allowed).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Number</label>
      <input type="text" id="val" name="val" placeholder="3.14 or -0.5">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { numeric: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/regexp.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — regexp</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › regexp</nav>
  <h1><code>regexp</code></h1>
  <p>Validates that a field value matches a given regular expression.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Alphanumeric (letters and digits only)</label>
      <input type="text" id="val" name="val" placeholder="abc123">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { regexp: { regexp: /^[a-z0-9]+$/i } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Create `examples/validators/uri.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — uri</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › uri</nav>
  <h1><code>uri</code></h1>
  <p>Validates that a field contains a valid URI.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">URL</label>
      <input type="url" id="val" name="val" placeholder="https://example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { uri: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add examples/validators/digits.html examples/validators/integer.html examples/validators/numeric.html examples/validators/regexp.html examples/validators/uri.html
git commit -m "feat(examples): add digits, integer, numeric, regexp, uri validator demos"
```

---

## Task 4: Core Validators — identical, different, between, greaterThan, lessThan

**Files:** Create `examples/validators/identical.html`, `different.html`, `between.html`, `greaterThan.html`, `lessThan.html`

Note: `identical` and `different` require two fields. The `compare` option names the field to compare against.

- [ ] **Step 1: Create `examples/validators/identical.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — identical</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › identical</nav>
  <h1><code>identical</code></h1>
  <p>Validates that a field value is identical to another field's value.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="pwd">Password</label>
      <input type="password" id="pwd" name="pwd" placeholder="Enter password">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label for="val">Confirm Password</label>
      <input type="password" id="val" name="val" placeholder="Repeat password">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        pwd: { validators: { notEmpty: {} } },
        val: { validators: { identical: { compare: 'pwd' } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/different.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — different</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › different</nav>
  <h1><code>different</code></h1>
  <p>Validates that a field value is different from another field's value.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" placeholder="Your username">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label for="val">Password (must differ from username)</label>
      <input type="password" id="val" name="val" placeholder="Your password">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        username: { validators: { notEmpty: {} } },
        val: { validators: { different: { compare: 'username' } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/between.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — between</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › between</nav>
  <h1><code>between</code></h1>
  <p>Validates that a numeric value is between <code>min</code> and <code>max</code> (inclusive by default).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Value (between 1 and 10)</label>
      <input type="number" id="val" name="val" placeholder="5">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { between: { min: 1, max: 10 } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/greaterThan.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — greaterThan</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › greaterThan</nav>
  <h1><code>greaterThan</code></h1>
  <p>Validates that a numeric value is greater than <code>min</code>.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Value (must be &gt; 0)</label>
      <input type="number" id="val" name="val" placeholder="5">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { greaterThan: { min: 0, inclusive: false } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Create `examples/validators/lessThan.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — lessThan</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › lessThan</nav>
  <h1><code>lessThan</code></h1>
  <p>Validates that a numeric value is less than <code>max</code>.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Value (must be &lt; 100)</label>
      <input type="number" id="val" name="val" placeholder="42">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { lessThan: { max: 100, inclusive: false } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add examples/validators/identical.html examples/validators/different.html examples/validators/between.html examples/validators/greaterThan.html examples/validators/lessThan.html
git commit -m "feat(examples): add identical, different, between, greaterThan, lessThan demos"
```

---

## Task 5: Core Validators — stringLength, stringCase, choice, file

**Files:** Create `examples/validators/stringLength.html`, `stringCase.html`, `choice.html`, `file.html`

Note: `choice` uses checkboxes. `file` uses `input[type="file"]`.

- [ ] **Step 1: Create `examples/validators/stringLength.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — stringLength</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › stringLength</nav>
  <h1><code>stringLength</code></h1>
  <p>Validates that a string's length is within the given range.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Username (3–20 characters)</label>
      <input type="text" id="val" name="val" placeholder="myusername">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { stringLength: { min: 3, max: 20 } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/stringCase.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — stringCase</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › stringCase</nav>
  <h1><code>stringCase</code></h1>
  <p>Validates that a string is entirely uppercase or entirely lowercase.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Uppercase text</label>
      <input type="text" id="val" name="val" placeholder="HELLO WORLD">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { stringCase: { case: 'upper' } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/choice.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — choice</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › choice</nav>
  <h1><code>choice</code></h1>
  <p>Validates that a minimum (and optionally maximum) number of checkboxes are selected.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label>Pick at least 1 fruit:</label>
      <label><input type="checkbox" name="val" value="apple"> Apple</label>
      <label><input type="checkbox" name="val" value="banana"> Banana</label>
      <label><input type="checkbox" name="val" value="cherry"> Cherry</label>
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { choice: { min: 1 } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'change' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/file.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — file</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › file</nav>
  <h1><code>file</code></h1>
  <p>Validates a file input: allowed types and/or maximum size.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Image (jpg, jpeg, png, gif — max 2 MB)</label>
      <input type="file" id="val" name="val">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { file: { types: 'jpg,jpeg,png,gif', maxSize: 2097152 } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'change' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Commit**

```bash
git add examples/validators/stringLength.html examples/validators/stringCase.html examples/validators/choice.html examples/validators/file.html
git commit -m "feat(examples): add stringLength, stringCase, choice, file validator demos"
```

---

## Task 6: Core Validators — callback, promise, remote, ip

**Files:** Create `examples/validators/callback.html`, `promise.html`, `remote.html`, `ip.html`

Note: `remote` shows a real config but the endpoint is a placeholder — a browser note explains it needs a live server.

- [ ] **Step 1: Create `examples/validators/callback.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — callback</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › callback</nav>
  <h1><code>callback</code></h1>
  <p>Validates using a synchronous custom function. Returns <code>{ valid: boolean }</code>.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Even number</label>
      <input type="number" id="val" name="val" placeholder="2, 4, 6…">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: {
          validators: {
            callback: {
              message: 'Please enter an even number',
              callback: function (input) {
                const n = parseInt(input.value, 10);
                return { valid: !isNaN(n) && n % 2 === 0 };
              }
            }
          }
        }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/promise.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — promise</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › promise</nav>
  <h1><code>promise</code></h1>
  <p>Validates using an async custom function. Returns <code>Promise&lt;{ valid: boolean }&gt;</code>. This demo simulates a 500 ms async check.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Username (async availability check)</label>
      <input type="text" id="val" name="val" placeholder="Try 'taken' or anything else">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: {
          validators: {
            promise: {
              message: 'That username is already taken',
              promise: function (input) {
                return new Promise(function (resolve) {
                  setTimeout(function () {
                    resolve({ valid: input.value !== 'taken' });
                  }, 500);
                });
              }
            }
          }
        }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/remote.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — remote</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › remote</nav>
  <h1><code>remote</code></h1>
  <p>Validates by sending the value to a remote endpoint and expecting <code>{ valid: true/false }</code>. This demo uses a simulated delay via <code>promise</code> — swap in the real <code>remote</code> config when you have an endpoint.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Username</label>
      <input type="text" id="val" name="val" placeholder="Try 'admin' (taken) or anything else">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    /*
      With a real endpoint, replace the promise validator below with:
      remote: {
        url: '/api/check-username',
        method: 'GET',
        name: 'username',
        message: 'That username is already taken',
      }
    */
    validare(document.getElementById('demo'), {
      fields: {
        val: {
          validators: {
            promise: {
              message: 'That username is already taken (simulated remote check)',
              promise: function (input) {
                return new Promise(function (resolve) {
                  setTimeout(function () {
                    resolve({ valid: input.value !== 'admin' });
                  }, 400);
                });
              }
            }
          }
        }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/ip.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — ip</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › ip</nav>
  <h1><code>ip</code></h1>
  <p>Validates that a field contains a valid IPv4 or IPv6 address.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">IP Address</label>
      <input type="text" id="val" name="val" placeholder="192.168.1.1 or ::1">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { ip: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Commit**

```bash
git add examples/validators/callback.html examples/validators/promise.html examples/validators/remote.html examples/validators/ip.html
git commit -m "feat(examples): add callback, promise, remote, ip validator demos"
```

---

## Task 7: Format Validators — mac, step, base64, hex, color, uuid

**Files:** Create `examples/validators/mac.html`, `step.html`, `base64.html`, `hex.html`, `color.html`, `uuid.html`

- [ ] **Step 1: Create `examples/validators/mac.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — mac</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › mac</nav>
  <h1><code>mac</code></h1>
  <p>Validates that a field contains a valid MAC address.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">MAC Address</label>
      <input type="text" id="val" name="val" placeholder="01:23:45:67:89:ab">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { mac: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/step.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — step</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › step</nav>
  <h1><code>step</code></h1>
  <p>Validates that a numeric value is a valid step from a base value.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Multiple of 0.5 (e.g. 0, 0.5, 1, 1.5…)</label>
      <input type="number" id="val" name="val" step="0.5" placeholder="1.5">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { step: { base: 0, step: 0.5 } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/base64.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — base64</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › base64</nav>
  <h1><code>base64</code></h1>
  <p>Validates that a field contains a valid Base64-encoded string.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Base64 String</label>
      <input type="text" id="val" name="val" placeholder="SGVsbG8gV29ybGQ=">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { base64: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/hex.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — hex</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › hex</nav>
  <h1><code>hex</code></h1>
  <p>Validates that a field contains a valid hexadecimal string.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Hex String</label>
      <input type="text" id="val" name="val" placeholder="1a2b3c">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { hex: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Create `examples/validators/color.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — color</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › color</nav>
  <h1><code>color</code></h1>
  <p>Validates that a field contains a valid CSS color value (hex, rgb, rgba, hsl, hsla, or named).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">CSS Color</label>
      <input type="text" id="val" name="val" placeholder="#ff0000 or rgb(255,0,0)">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { color: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Create `examples/validators/uuid.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — uuid</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › uuid</nav>
  <h1><code>uuid</code></h1>
  <p>Validates that a field contains a valid UUID (versions 3, 4, and 5 supported).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">UUID</label>
      <input type="text" id="val" name="val" placeholder="550e8400-e29b-41d4-a716-446655440000">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { uuid: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 7: Commit**

```bash
git add examples/validators/mac.html examples/validators/step.html examples/validators/base64.html examples/validators/hex.html examples/validators/color.html examples/validators/uuid.html
git commit -m "feat(examples): add mac, step, base64, hex, color, uuid validator demos"
```

---

## Task 8: Format & Financial Validators — bic, iban, vat, cusip, isin

**Files:** Create `examples/validators/bic.html`, `iban.html`, `vat.html`, `cusip.html`, `isin.html`

Note: `vat` uses `country: 'GB'` as a hardcoded country for the demo.

- [ ] **Step 1: Create `examples/validators/bic.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — bic</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › bic</nav>
  <h1><code>bic</code></h1>
  <p>Validates that a field contains a valid BIC/SWIFT code.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">BIC / SWIFT Code</label>
      <input type="text" id="val" name="val" placeholder="DEUTDEDB">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { bic: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/iban.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — iban</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › iban</nav>
  <h1><code>iban</code></h1>
  <p>Validates that a field contains a valid IBAN (International Bank Account Number).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">IBAN</label>
      <input type="text" id="val" name="val" placeholder="GB29NWBK60161331926819">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { iban: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/vat.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — vat</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › vat</nav>
  <h1><code>vat</code></h1>
  <p>Validates a VAT number for a given country. This demo is hardcoded to <strong>GB</strong> (United Kingdom).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">UK VAT Number</label>
      <input type="text" id="val" name="val" placeholder="GB999999973">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { vat: { country: 'GB' } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/cusip.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — cusip</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › cusip</nav>
  <h1><code>cusip</code></h1>
  <p>Validates that a field contains a valid CUSIP (9-character securities identifier).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">CUSIP</label>
      <input type="text" id="val" name="val" placeholder="037833100">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { cusip: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Create `examples/validators/isin.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — isin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › isin</nav>
  <h1><code>isin</code></h1>
  <p>Validates that a field contains a valid ISIN (12-character International Securities Identification Number).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">ISIN</label>
      <input type="text" id="val" name="val" placeholder="US0378331005">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { isin: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add examples/validators/bic.html examples/validators/iban.html examples/validators/vat.html examples/validators/cusip.html examples/validators/isin.html
git commit -m "feat(examples): add bic, iban, vat, cusip, isin validator demos"
```

---

## Task 9: Financial & Publication Validators — sedol, grid, ean, isbn, ismn

**Files:** Create `examples/validators/sedol.html`, `grid.html`, `ean.html`, `isbn.html`, `ismn.html`

- [ ] **Step 1: Create `examples/validators/sedol.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — sedol</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › sedol</nav>
  <h1><code>sedol</code></h1>
  <p>Validates that a field contains a valid SEDOL (Stock Exchange Daily Official List) code.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">SEDOL</label>
      <input type="text" id="val" name="val" placeholder="B00030">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { sedol: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/grid.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — grid</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › grid</nav>
  <h1><code>grid</code></h1>
  <p>Validates that a field contains a valid Global Release Identifier (GRid).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">GRid</label>
      <input type="text" id="val" name="val" placeholder="PADPGH0SCVS">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { grid: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/ean.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — ean</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › ean</nav>
  <h1><code>ean</code></h1>
  <p>Validates that a field contains a valid EAN barcode (EAN-8 or EAN-13).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">EAN Barcode</label>
      <input type="text" id="val" name="val" placeholder="4006381333931">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { ean: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/isbn.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — isbn</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › isbn</nav>
  <h1><code>isbn</code></h1>
  <p>Validates that a field contains a valid ISBN (ISBN-10 or ISBN-13).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">ISBN</label>
      <input type="text" id="val" name="val" placeholder="9780306406157">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { isbn: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Create `examples/validators/ismn.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — ismn</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › ismn</nav>
  <h1><code>ismn</code></h1>
  <p>Validates that a field contains a valid ISMN (International Standard Music Number).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">ISMN</label>
      <input type="text" id="val" name="val" placeholder="M-2306-7118-7">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { ismn: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add examples/validators/sedol.html examples/validators/grid.html examples/validators/ean.html examples/validators/isbn.html examples/validators/ismn.html
git commit -m "feat(examples): add sedol, grid, ean, isbn, ismn validator demos"
```

---

## Task 10: Publication & Device Validators — issn, imei, imo, meid, vin

**Files:** Create `examples/validators/issn.html`, `imei.html`, `imo.html`, `meid.html`, `vin.html`

- [ ] **Step 1: Create `examples/validators/issn.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — issn</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › issn</nav>
  <h1><code>issn</code></h1>
  <p>Validates that a field contains a valid ISSN (International Standard Serial Number).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">ISSN</label>
      <input type="text" id="val" name="val" placeholder="0378-5955">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { issn: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/imei.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — imei</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › imei</nav>
  <h1><code>imei</code></h1>
  <p>Validates that a field contains a valid IMEI (15-digit mobile device identifier, Luhn check).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">IMEI</label>
      <input type="text" id="val" name="val" placeholder="490154203237518">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { imei: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/imo.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — imo</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › imo</nav>
  <h1><code>imo</code></h1>
  <p>Validates that a field contains a valid IMO ship number (format: <code>IMO NNNNNNN</code>).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">IMO Number</label>
      <input type="text" id="val" name="val" placeholder="IMO 9074729">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { imo: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/meid.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — meid</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › meid</nav>
  <h1><code>meid</code></h1>
  <p>Validates that a field contains a valid MEID (14-character hex or 18-digit decimal mobile device identifier).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">MEID (hex)</label>
      <input type="text" id="val" name="val" placeholder="A10000009296F2">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { meid: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Create `examples/validators/vin.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — vin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › vin</nav>
  <h1><code>vin</code></h1>
  <p>Validates that a field contains a valid VIN (Vehicle Identification Number).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">VIN</label>
      <input type="text" id="val" name="val" placeholder="1HGBH41JXMN109186">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { vin: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add examples/validators/issn.html examples/validators/imei.html examples/validators/imo.html examples/validators/meid.html examples/validators/vin.html
git commit -m "feat(examples): add issn, imei, imo, meid, vin validator demos"
```

---

## Task 11: Tax/Business & Identity Validators — ein, rtn, siren, siret, id, phone, zipCode

**Files:** Create `examples/validators/ein.html`, `rtn.html`, `siren.html`, `siret.html`, `id.html`, `phone.html`, `zipCode.html`

Note: `id`, `phone`, and `zipCode` require a `country` option. This demo hardcodes representative countries: `id` → US (SSN), `phone` → US, `zipCode` → US.

- [ ] **Step 1: Create `examples/validators/ein.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — ein</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › ein</nav>
  <h1><code>ein</code></h1>
  <p>Validates that a field contains a valid US Employer Identification Number (EIN).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">EIN</label>
      <input type="text" id="val" name="val" placeholder="07-1234567">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { ein: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/validators/rtn.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — rtn</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › rtn</nav>
  <h1><code>rtn</code></h1>
  <p>Validates that a field contains a valid US ABA Routing Transit Number (9 digits, checksum verified).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">RTN</label>
      <input type="text" id="val" name="val" placeholder="021000021">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { rtn: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/validators/siren.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — siren</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › siren</nav>
  <h1><code>siren</code></h1>
  <p>Validates that a field contains a valid French SIREN company identifier (9 digits, Luhn check).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">SIREN</label>
      <input type="text" id="val" name="val" placeholder="443061841">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { siren: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/validators/siret.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — siret</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › siret</nav>
  <h1><code>siret</code></h1>
  <p>Validates that a field contains a valid French SIRET establishment identifier (14 digits).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">SIRET</label>
      <input type="text" id="val" name="val" placeholder="44306184100047">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { siret: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Create `examples/validators/id.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — id</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › id</nav>
  <h1><code>id</code></h1>
  <p>Validates a national ID number for a specific country. This demo is hardcoded to <strong>US</strong> (Social Security Number).</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">US Social Security Number</label>
      <input type="text" id="val" name="val" placeholder="123-45-6789">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { id: { country: 'US' } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Create `examples/validators/phone.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — phone</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › phone</nav>
  <h1><code>phone</code></h1>
  <p>Validates a phone number for a specific country. This demo is hardcoded to <strong>US</strong>.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">US Phone Number</label>
      <input type="text" id="val" name="val" placeholder="(555) 555-5555">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { phone: { country: 'US' } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 7: Create `examples/validators/zipCode.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — zipCode</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Validators</a> › zipCode</nav>
  <h1><code>zipCode</code></h1>
  <p>Validates a postal / ZIP code for a specific country. This demo is hardcoded to <strong>US</strong>.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">US ZIP Code</label>
      <input type="text" id="val" name="val" placeholder="10001 or 10001-1234">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: { validators: { zipCode: { country: 'US' } } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 8: Commit**

```bash
git add examples/validators/ein.html examples/validators/rtn.html examples/validators/siren.html examples/validators/siret.html examples/validators/id.html examples/validators/phone.html examples/validators/zipCode.html
git commit -m "feat(examples): add ein, rtn, siren, siret, id, phone, zipCode validator demos"
```

---

## Task 12: Core Plugin Examples — Trigger, Message, Icon, SubmitButton, Excluded, Sequence

**Files:** Create `examples/plugins/Trigger.html`, `Message.html`, `Icon.html`, `SubmitButton.html`, `Excluded.html`, `Sequence.html`

- [ ] **Step 1: Create `examples/plugins/Trigger.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Trigger Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › Trigger</nav>
  <h1><code>Trigger</code> Plugin</h1>
  <p>Automatically triggers validation on DOM events (<code>blur</code>, <code>input</code>, <code>change</code>). Without this plugin, validation only runs on submit.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="email">Email (validated on blur)</label>
      <input type="email" id="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label for="username">Username (validated on input)</label>
      <input type="text" id="username" name="username" placeholder="Type to validate live">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        email:    { validators: { notEmpty: {}, email: {} } },
        username: { validators: { notEmpty: {}, stringLength: { min: 3, max: 20 } } }
      },
      plugins: {
        triggerBlur:  new Trigger({ event: 'blur',  fields: ['email'] }),
        triggerInput: new Trigger({ event: 'input', fields: ['username'] }),
        message:      new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/plugins/Message.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Message Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › Message</nav>
  <h1><code>Message</code> Plugin</h1>
  <p>Displays validation error messages in the nearest <code>.fv-plugins-message-container</code> element. Submit the form to see messages appear.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="name">Full Name</label>
      <input type="text" id="name" name="name" placeholder="Jane Doe">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="jane@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Submit</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        name:  { validators: { notEmpty: {}, stringLength: { min: 2 } } },
        email: { validators: { notEmpty: {}, email: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/plugins/Icon.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Icon Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
  <style>
    .icon { display: inline-block; margin-left: 0.5rem; font-style: normal; }
    .icon-valid   { color: #28a745; }
    .icon-invalid { color: #dc3545; }
  </style>
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › Icon</nav>
  <h1><code>Icon</code> Plugin</h1>
  <p>Appends a status icon element next to each field. The icon's class changes to reflect the validation state.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="email">Email <span class="icon" id="email-icon"></span></label>
      <input type="email" id="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger, Icon } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        email: { validators: { notEmpty: {}, email: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        message: new Message(),
        icon: new Icon({
          valid:   '<span class="icon icon-valid">✓</span>',
          invalid: '<span class="icon icon-invalid">✗</span>'
        })
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Create `examples/plugins/SubmitButton.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — SubmitButton Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › SubmitButton</nav>
  <h1><code>SubmitButton</code> Plugin</h1>
  <p>Disables the submit button while validation is in progress (useful with async validators). Fill both fields to enable submit.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label for="pwd">Password (min 6 chars)</label>
      <input type="password" id="pwd" name="pwd" placeholder="••••••">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit" id="btn">Submit</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger, SubmitButton } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        email: { validators: { notEmpty: {}, email: {} } },
        pwd:   { validators: { notEmpty: {}, stringLength: { min: 6 } } }
      },
      plugins: {
        trigger:      new Trigger({ event: 'blur' }),
        message:      new Message(),
        submitButton: new SubmitButton()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 5: Create `examples/plugins/Excluded.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Excluded Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › Excluded</nav>
  <h1><code>Excluded</code> Plugin</h1>
  <p>Skips validation for disabled fields and <code>type="hidden"</code> inputs. The hidden field below has <code>notEmpty</code> configured but is excluded from validation.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="name">Name</label>
      <input type="text" id="name" name="name" placeholder="Jane Doe">
      <div class="fv-plugins-message-container"></div>
    </div>
    <input type="hidden" name="token" value="">
    <div class="field">
      <label for="city">City (disabled — skipped)</label>
      <input type="text" id="city" name="city" value="Paris" disabled>
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Submit</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger, Excluded } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        name:  { validators: { notEmpty: {} } },
        token: { validators: { notEmpty: { message: 'Token is required (but this field is excluded)' } } },
        city:  { validators: { notEmpty: { message: 'City is required (but this field is disabled)' } } }
      },
      plugins: {
        trigger:  new Trigger({ event: 'blur' }),
        message:  new Message(),
        excluded: new Excluded()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 6: Create `examples/plugins/Sequence.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Sequence Plugin</title>
  <link rel="stylesheet" href="../shared/style.css">
</head>
<body>
  <nav><a href="../index.html">Examples</a> › <a href="index.html">Plugins</a> › Sequence</nav>
  <h1><code>Sequence</code> Plugin</h1>
  <p>Runs validators one at a time and stops at the first failure. Without Sequence, all validators run in parallel. Try entering <code>ab</code> — you'll see only the <code>stringLength</code> message, not the <code>email</code> message.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label for="val">Email (min 5 chars)</label>
      <input type="text" id="val" name="val" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Message, Trigger, Sequence } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        val: {
          validators: {
            notEmpty:     {},
            stringLength: { min: 5 },
            email:        {}
          }
        }
      },
      plugins: {
        trigger:  new Trigger({ event: 'blur' }),
        message:  new Message(),
        sequence: new Sequence()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 7: Commit**

```bash
git add examples/plugins/Trigger.html examples/plugins/Message.html examples/plugins/Icon.html examples/plugins/SubmitButton.html examples/plugins/Excluded.html examples/plugins/Sequence.html
git commit -m "feat(examples): add Trigger, Message, Icon, SubmitButton, Excluded, Sequence plugin demos"
```

---

## Task 13: CSS Framework Plugin Examples — Bootstrap5, Bulma, Tailwind

**Files:** Create `examples/plugins/Bootstrap5.html`, `Bulma.html`, `Tailwind.html`

Note: These load their CSS frameworks from CDN. The shared `style.css` is NOT loaded — styling comes entirely from the framework. The Bootstrap5/Bulma/Tailwind plugins inject the framework's own validation classes.

- [ ] **Step 1: Create `examples/plugins/Bootstrap5.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Bootstrap5 Plugin</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <style>body { max-width: 640px; margin: 2rem auto; padding: 0 1rem; }</style>
</head>
<body>
  <nav class="mb-3 small">
    <a href="../index.html">Examples</a> ›
    <a href="index.html">Plugins</a> › Bootstrap5
  </nav>
  <h1 class="h4">Bootstrap5 Plugin</h1>
  <p class="text-muted">Applies Bootstrap 5 validation classes (<code>is-valid</code>, <code>is-invalid</code>) and renders messages in <code>.invalid-feedback</code> containers.</p>
  <form id="demo" novalidate>
    <div class="mb-3">
      <label for="name" class="form-label">Full Name</label>
      <input type="text" id="name" name="name" class="form-control" placeholder="Jane Doe">
      <div class="invalid-feedback"></div>
    </div>
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input type="email" id="email" name="email" class="form-control" placeholder="jane@example.com">
      <div class="invalid-feedback"></div>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Trigger, Bootstrap5 } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        name:  { validators: { notEmpty: {}, stringLength: { min: 2 } } },
        email: { validators: { notEmpty: {}, email: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        ui:      new Bootstrap5()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Create `examples/plugins/Bulma.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Bulma Plugin</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css">
  <style>body { max-width: 640px; margin: 2rem auto; padding: 0 1rem; }</style>
</head>
<body>
  <nav class="mb-3 is-size-7">
    <a href="../index.html">Examples</a> ›
    <a href="index.html">Plugins</a> › Bulma
  </nav>
  <h1 class="title is-5">Bulma Plugin</h1>
  <p class="subtitle is-6">Applies Bulma validation classes (<code>is-success</code>, <code>is-danger</code>) and renders messages in <code>.help</code> containers.</p>
  <form id="demo" novalidate>
    <div class="field">
      <label class="label" for="name">Full Name</label>
      <div class="control">
        <input type="text" id="name" name="name" class="input" placeholder="Jane Doe">
      </div>
      <p class="help"></p>
    </div>
    <div class="field">
      <label class="label" for="email">Email</label>
      <div class="control">
        <input type="email" id="email" name="email" class="input" placeholder="jane@example.com">
      </div>
      <p class="help"></p>
    </div>
    <div class="field">
      <div class="control">
        <button type="submit" class="button is-primary">Submit</button>
      </div>
    </div>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Trigger, Bulma } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        name:  { validators: { notEmpty: {}, stringLength: { min: 2 } } },
        email: { validators: { notEmpty: {}, email: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        ui:      new Bulma()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Create `examples/plugins/Tailwind.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Validare — Tailwind Plugin</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="max-w-lg mx-auto mt-8 px-4 font-sans">
  <nav class="mb-4 text-sm text-gray-500">
    <a href="../index.html" class="text-blue-600 hover:underline">Examples</a> ›
    <a href="index.html" class="text-blue-600 hover:underline">Plugins</a> › Tailwind
  </nav>
  <h1 class="text-xl font-semibold mb-1">Tailwind Plugin</h1>
  <p class="text-gray-500 mb-6 text-sm">Applies Tailwind validation classes (<code>border-green-500</code>, <code>border-red-500</code>) and renders error messages below each field.</p>
  <form id="demo" novalidate>
    <div class="mb-4">
      <label for="name" class="block font-medium mb-1">Full Name</label>
      <input type="text" id="name" name="name"
             class="w-full border rounded px-3 py-2 text-sm focus:outline-none"
             placeholder="Jane Doe">
      <p class="text-red-600 text-xs mt-1 fv-plugins-message-container"></p>
    </div>
    <div class="mb-4">
      <label for="email" class="block font-medium mb-1">Email</label>
      <input type="email" id="email" name="email"
             class="w-full border rounded px-3 py-2 text-sm focus:outline-none"
             placeholder="jane@example.com">
      <p class="text-red-600 text-xs mt-1 fv-plugins-message-container"></p>
    </div>
    <button type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
      Submit
    </button>
  </form>
  <script src="../../dist/index.umd.js"></script>
  <script>
    const { validare, Trigger, Tailwind } = Validare;
    validare(document.getElementById('demo'), {
      fields: {
        name:  { validators: { notEmpty: {}, stringLength: { min: 2 } } },
        email: { validators: { notEmpty: {}, email: {} } }
      },
      plugins: {
        trigger: new Trigger({ event: 'blur' }),
        ui:      new Tailwind()
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add examples/plugins/Bootstrap5.html examples/plugins/Bulma.html examples/plugins/Tailwind.html
git commit -m "feat(examples): add Bootstrap5, Bulma, Tailwind plugin demos"
```

---

## Verification

After all tasks are complete, open each page in a browser and confirm:

1. The shared style loads correctly (no 404 for `style.css` or `index.umd.js`)
2. Entering an invalid value and tabbing away shows a red error message
3. Entering a valid value and tabbing away clears the error
4. Clicking Submit with empty fields shows all error messages

Spot-check validators:
- `notEmpty.html` — empty field → error; any text → valid
- `email.html` — `"not-an-email"` → error; `"a@b.com"` → valid
- `creditCard.html` — `"1234"` → error; `"4111111111111111"` → valid
- `identical.html` — mismatched passwords → error; matching → valid
- `choice.html` — 0 checked → error; 1+ checked → valid
- `callback.html` — odd number → error; even number → valid
- `promise.html` — type `"taken"` → error; anything else → valid (after 500 ms)
- `Bootstrap5.html` / `Bulma.html` / `Tailwind.html` — framework styles apply correctly
