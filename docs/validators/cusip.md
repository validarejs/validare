# `cusip` — Validare Validator

Validates a CUSIP (Committee on Uniform Securities Identification Procedures) number used to identify North American securities.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    cusip: {
      validators: {
        cusip: {
          message: 'Please enter a valid CUSIP number',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"037833100"` | Apple Inc. CUSIP |
| `"38259P508"` | Google (Alphabet) CUSIP |

## Invalid Values

| Value | Reason |
|---|---|
| `"037833101"` | Fails check digit |
| `"12345678"` | Too short (8 chars instead of 9) |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- CUSIP is always 9 characters: 6 alphanumeric issuer, 2 issue, 1 check digit.
