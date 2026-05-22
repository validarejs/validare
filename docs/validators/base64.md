# `base64` — Validare Validator

Validates that a field contains a valid Base64 encoded string.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    encodedData: {
      validators: {
        base64: {
          message: 'Please enter a valid Base64 string',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"SGVsbG8="` | "Hello" in Base64 |
| `"dGVzdA=="` | "test" in Base64 |

## Invalid Values

| Value | Reason |
|---|---|
| `"Hello!"` | Contains `!` which is not a Base64 character |
| `"SGVsbG8"` | Missing required padding (`=`) |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
