# `step` — Validare Validator

Validates that a number is a multiple of a step value from a base.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `step` | `number` | `1` | The step increment |
| `baseValue` | `number` | `0` | The base value from which multiples are counted |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    quantity: {
      validators: {
        step: {
          step: 5,
          message: 'Quantity must be a multiple of 5',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"5"` | Multiple of 5 from base 0 |
| `"100"` | Multiple of 5 |
| `"0"` | Base value itself |

## Invalid Values

| Value | Reason |
|---|---|
| `"3"` | Not a multiple of 5 |
| `"5.5"` | Not a multiple of step=1 (default) |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- `baseValue` shifts the valid range: with `baseValue: 1, step: 2`, valid values are 1, 3, 5, 7…
