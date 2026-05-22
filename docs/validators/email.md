# `email` — Validare Validator

Validates that a field contains a valid email address.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    email: {
      validators: {
        email: {
          message: 'Please enter a valid email address',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"user@example.com"` | Standard email |
| `"user+tag@sub.example.co.uk"` | Subdomains and tags |

## Invalid Values

| Value | Reason |
|---|---|
| `"user@"` | Missing domain |
| `"user"` | No @ symbol |
| `"@example.com"` | Missing local part |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
