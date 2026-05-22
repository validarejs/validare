# `hex` — Validare Validator

Validates that a field contains a hexadecimal number.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    colorCode: {
      validators: {
        hex: {
          message: 'Please enter a valid hexadecimal value',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"FF5733"` | Valid hex digits |
| `"0a1b2c"` | Lowercase hex |
| `"0"` | Single digit |

## Invalid Values

| Value | Reason |
|---|---|
| `"GG5733"` | `G` is not a hex digit |
| `"#FF5733"` | Hash prefix is not allowed |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- For CSS color validation (with `#` prefix, `rgb()`, etc.), use `color` instead.
