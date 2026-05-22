# `imei` — Validare Validator

Validates an IMEI (International Mobile Equipment Identity) number.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    deviceImei: {
      validators: {
        imei: {
          message: 'Please enter a valid IMEI number',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"356938035643809"` | Valid 15-digit IMEI |
| `"35 693803 564380 9"` | Valid IMEI with spaces |

## Invalid Values

| Value | Reason |
|---|---|
| `"123456789012345"` | Fails Luhn checksum |
| `"12345678901234"` | Only 14 digits |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- IMEI is 15 digits. Accepts with or without spaces or hyphens as separators.
- Uses the Luhn algorithm for checksum validation.
