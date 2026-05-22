# `grid` — Validare Validator

Validates a GRId (Global Release Identifier) used to identify music releases.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    releaseId: {
      validators: {
        grid: {
          message: 'Please enter a valid GRId',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"A1-2425G-ABC1234002-M"` | Valid GRId with hyphens |
| `"A12425GABC1234002M"` | Valid GRId without hyphens |

## Invalid Values

| Value | Reason |
|---|---|
| `"A1-2425G-ABC1234002-N"` | Fails check character |
| `"INVALID"` | Does not match GRId format |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- GRId format: scheme identifier (2) + issuer code (5) + release number (10) + check character (1).
