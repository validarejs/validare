# `isin` — Validare Validator

Validates an ISIN (International Securities Identification Number).

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    isin: {
      validators: {
        isin: {
          message: 'Please enter a valid ISIN',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"US0378331005"` | Apple Inc. ISIN |
| `"DE0005140008"` | Deutsche Bank ISIN |

## Invalid Values

| Value | Reason |
|---|---|
| `"US0378331006"` | Fails Luhn check digit |
| `"XX0378331005"` | Unknown country code prefix |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Format: 2-letter country code + 9 alphanumeric chars + 1 check digit (12 chars total).
