# `numeric` — Validare Validator

Validates that a field contains a numeric value, with support for custom thousand and decimal separators.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `thousandsSeparator` | `string` | `""` | Character used as thousands separator (e.g. `","`) |
| `decimalSeparator` | `string` | `"."` | Character used as decimal separator |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    price: {
      validators: {
        numeric: {
          thousandsSeparator: ',',
          decimalSeparator: '.',
          message: 'Please enter a valid number',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"1234.56"` | Standard decimal |
| `"1,234.56"` | With thousands separator |
| `"-42"` | Negative number |

## Invalid Values

| Value | Reason |
|---|---|
| `"abc"` | Not a number |
| `"1.234,56"` | Separators swapped without reconfiguring |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- For European format, use `thousandsSeparator: "."` and `decimalSeparator: ","`.
