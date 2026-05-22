# `meid` — Validare Validator

Validates a MEID (Mobile Equipment Identifier) used in CDMA devices.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    deviceMeid: {
      validators: {
        meid: {
          message: 'Please enter a valid MEID',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"A10000009296F2"` | Valid 14-char hex MEID |
| `"490154203237518"` | Valid 15-digit decimal MEID |

## Invalid Values

| Value | Reason |
|---|---|
| `"Z10000009296F2"` | `Z` is not a valid hex digit in MEID |
| `"12345"` | Too short |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- MEID is 14 hexadecimal characters or 18 decimal digits. The 15-digit form shown above is a decimal MEID.
