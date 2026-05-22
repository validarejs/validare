# `imo` — Validare Validator

Validates an IMO (International Maritime Organization) ship number.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    shipNumber: {
      validators: {
        imo: {
          message: 'Please enter a valid IMO number',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"IMO 1234567"` | Standard IMO format |

## Invalid Values

| Value | Reason |
|---|---|
| `"IMO 1234568"` | Fails weighted checksum |
| `"IMO 123456"` | Only 6 digits after prefix |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Format must be `"IMO NNNNNNN"` (the `"IMO "` prefix is required). The check digit is a weighted sum of the first 6 digits.
