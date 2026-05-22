# `callback` — Validare Validator

Validates a field using a custom synchronous function.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `callback` | `(input: ValidatorInput) => { valid: boolean, message?: string }` | *required* | Custom validation function |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    username: {
      validators: {
        callback: {
          message: 'Username must start with a letter',
          callback: (input) => {
            return { valid: /^[a-zA-Z]/.test(input.value) };
          },
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| Callback returns `{ valid: true }` | Validation passes |

## Invalid Values

| Value | Reason |
|---|---|
| Callback returns `{ valid: false }` | Validation fails with default or inline message |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- The `input` object has: `value` (string), `elements` (HTMLElement[]), `options` (validator options), `field` (field name).
- The callback can return `{ valid: false, message: 'Custom message' }` to override the configured message.
- For async operations, use `promise` instead.
