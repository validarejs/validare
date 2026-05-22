# `lessThan` — Validare Validator

Validates that a numeric value is less than (or equal to) a maximum.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `max` | `number` | *required* | Maximum allowed value |
| `inclusive` | `boolean` | `true` | If `true`, the maximum value itself is valid |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    discount: {
      validators: {
        lessThan: {
          max: 100,
          message: 'Discount cannot exceed 100%',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"100"` | Equal to max (inclusive=true) |
| `"50"` | Below max |

## Invalid Values

| Value | Reason |
|---|---|
| `"101"` | Above max |
| `"100"` | Equal to max when `inclusive: false` |
| `"abc"` | Not a number |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- With `inclusive: true` (default), the boundary value itself is valid.
