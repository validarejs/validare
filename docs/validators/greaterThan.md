# `greaterThan` — Validare Validator

Validates that a numeric value is greater than (or equal to) a minimum.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `min` | `number` | *required* | Minimum allowed value |
| `inclusive` | `boolean` | `true` | If `true`, the minimum value itself is valid |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    price: {
      validators: {
        greaterThan: {
          min: 0,
          inclusive: false,
          message: 'Price must be greater than 0',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"10"` | Equal to min (inclusive=true) |
| `"100"` | Above min |

## Invalid Values

| Value | Reason |
|---|---|
| `"9"` | Below min=10 |
| `"0"` | Equal to min when `inclusive: false` |
| `"abc"` | Not a number |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- With `inclusive: true` (default), the boundary value itself is valid.
