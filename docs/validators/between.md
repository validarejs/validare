# `between` — Validare Validator

Validates that a numeric value is between a minimum and maximum.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `min` | `number` | *required* | Minimum allowed value |
| `max` | `number` | *required* | Maximum allowed value |
| `inclusive` | `boolean` | `true` | If `true`, min and max themselves are valid |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    age: {
      validators: {
        between: {
          min: 18,
          max: 99,
          message: 'Age must be between 18 and 99',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"18"` | Equal to min (inclusive=true) |
| `"50"` | Between min and max |
| `"99"` | Equal to max (inclusive=true) |

## Invalid Values

| Value | Reason |
|---|---|
| `"17"` | Below min |
| `"100"` | Above max |
| `"18"` | When `inclusive: false` |
| `"abc"` | Not a number |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- `inclusive: false` means min and max themselves are invalid.
