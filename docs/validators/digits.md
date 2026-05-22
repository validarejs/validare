# `digits` — Validare Validator

Validates that a field contains only digit characters (0–9).

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    postalCode: {
      validators: {
        digits: {
          message: 'Only digits are allowed',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"123456"` | All digits |
| `"0"` | Single digit |

## Invalid Values

| Value | Reason |
|---|---|
| `"12a456"` | Contains a letter |
| `"123 456"` | Contains a space |
| `"3.14"` | Contains a decimal point |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- Does not allow spaces, dots, or signs. Use `numeric` or `integer` for those cases.
