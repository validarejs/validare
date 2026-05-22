# `integer` — Validare Validator

Validates that a field contains a whole number (positive or negative).

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    quantity: {
      validators: {
        integer: {
          message: 'Please enter a whole number',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"42"` | Positive integer |
| `"-42"` | Negative integer |
| `"0"` | Zero |

## Invalid Values

| Value | Reason |
|---|---|
| `"3.14"` | Decimal number |
| `"1e5"` | Scientific notation |
| `"abc"` | Not a number |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- For positive integers only, combine with `greaterThan: { min: 0 }`.
