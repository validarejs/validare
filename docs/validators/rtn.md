# `rtn` — Validare Validator

Validates a US RTN (Routing Transit Number) used to identify financial institutions.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    routingNumber: {
      validators: {
        rtn: {
          message: 'Please enter a valid routing number',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"021000021"` | JPMorgan Chase routing number |
| `"011000138"` | Bank of America routing number |

## Invalid Values

| Value | Reason |
|---|---|
| `"021000022"` | Fails weighted checksum |
| `"12345678"` | Only 8 digits instead of 9 |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- RTN is exactly 9 digits. Validated using a weighted checksum (mod 10).
