# Validare

Modern JavaScript form validation library. Plugin-based, zero dependencies, TypeScript-first.

Inspired by [FormValidation](https://formvalidation.io/) (discontinued).

## Features

- Written in TypeScript — full type safety
- Zero dependencies — no jQuery, no frameworks
- Plugin-based architecture — small core, everything else is a plugin
- 22 built-in validators
- CSS framework integrations (Bootstrap 5, Bulma, Tailwind)
- Sync and async validators
- Localization support
- Works as ESM, CommonJS, or browser global (UMD)

## Installation

```bash
npm install validare
```

## Quick Start

```html
<form id="myForm">
  <input type="text" name="fullName" />
  <input type="email" name="email" />
  <button type="submit">Submit</button>
</form>
```

```js
import { validare, Trigger, Message, SubmitButton, Bootstrap5 } from 'validare';

const fv = validare(document.getElementById('myForm'), {
  plugins: {
    trigger: new Trigger({ event: 'blur' }),
    message: new Message(),
    submitButton: new SubmitButton(),
    ui: new Bootstrap5(),
  },
  fields: {
    fullName: {
      validators: {
        notEmpty: { message: 'Full name is required' },
        stringLength: { min: 2, max: 50, message: 'Name must be between 2 and 50 characters' },
      },
    },
    email: {
      validators: {
        notEmpty: { message: 'Email is required' },
        email: { message: 'Please enter a valid email address' },
      },
    },
  },
});

// Validate on submit
document.getElementById('myForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const result = await fv.validate();
  if (result === 'Valid') {
    console.log('Form is valid — submit!');
  }
});
```

## Browser (CDN)

```html
<script src="https://unpkg.com/validare/dist/index.umd.js"></script>
<script>
  const { validare, Trigger, Message, Bootstrap5 } = Validare;

  const fv = validare(document.getElementById('myForm'), {
    plugins: {
      trigger: new Trigger({ event: 'blur' }),
      message: new Message(),
      ui: new Bootstrap5(),
    },
    fields: {
      email: { validators: { notEmpty: {}, email: {} } },
    },
  });
</script>
```

## Localization

```js
import { validare, pt_BR } from 'validare';

const fv = validare(form, {
  locale: pt_BR,
  fields: { /* ... */ },
});
```

Available locales: `en_US` (default), `pt_BR`.

## Validators

| Name | Description |
|---|---|
| `notEmpty` | Not empty (supports `trim`) |
| `email` | Valid email address |
| `creditCard` | Credit card number (Luhn) |
| `date` | Date in specified format |
| `digits` | Digits only |
| `integer` | Integer (positive or negative) |
| `numeric` | Numeric value |
| `regexp` | Matches a regular expression |
| `uri` | Valid URL |
| `identical` | Equal to another field |
| `different` | Different from another field |
| `between` | Between min and max |
| `greaterThan` | Greater than (or equal to) a value |
| `lessThan` | Less than (or equal to) a value |
| `stringLength` | String length (min/max) |
| `stringCase` | Uppercase or lowercase |
| `choice` | Number of checked options |
| `file` | File type/size |
| `callback` | Custom synchronous function |
| `promise` | Custom async function |
| `remote` | Remote validation via fetch |
| `ip` | IP address (IPv4 and IPv6) |

## Plugins

### Core Plugins

| Plugin | Description |
|---|---|
| `Trigger` | Validate on DOM events (`blur`, `input`, `change`) |
| `Message` | Display error messages |
| `Icon` | Show valid/invalid icons |
| `SubmitButton` | Disable submit during validation |
| `Excluded` | Exclude disabled/hidden fields |
| `Sequence` | Stop at first error per field |

### CSS Framework Plugins

| Plugin | Framework |
|---|---|
| `Bootstrap5` | Bootstrap 5 (`is-valid`/`is-invalid`) |
| `Bulma` | Bulma (`is-success`/`is-danger`) |
| `Tailwind` | Tailwind CSS (configurable classes) |

## Custom Validators

```js
const fv = validare(form, {
  fields: {
    username: {
      validators: {
        callback: {
          message: 'Username already taken',
          callback: async (input) => {
            const res = await fetch(`/api/check?username=${input.value}`);
            return { valid: res.ok };
          },
        },
      },
    },
  },
});
```

## API

```ts
const fv = validare(form, options);

fv.validate(): Promise<'Valid' | 'Invalid' | 'NotValidated'>
fv.validateField(field: string): Promise<'Valid' | 'Invalid' | 'NotValidated'>
fv.addField(field: string, options: FieldOptions): Core
fv.removeField(field: string): Core
fv.enableValidator(field: string, validator: string): Core
fv.disableValidator(field: string, validator: string): Core
fv.resetField(field: string): Core
fv.reset(): Core
fv.destroy(): void
fv.on(event: string, handler: Function): Core
fv.off(event: string, handler: Function): Core
```

## License

MIT
