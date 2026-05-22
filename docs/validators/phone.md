# `phone` — Validare Validator

Validates a phone number for a specified country.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `country` | `string` | `undefined` | ISO 3166-1 alpha-2 country code |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    phoneNumber: {
      validators: {
        phone: {
          country: 'US',
          message: 'Please enter a valid US phone number',
        },
      },
    },
  },
});
```

## Valid Values by Country (examples)

| Country | Value | Notes |
|---|---|---|
| `US` | `"+1 (555) 123-4567"` | US number |
| `BR` | `"(11) 98765-4321"` | Brazilian mobile |
| `DE` | `"030 12345678"` | German landline |
| `GB` | `"07700 900123"` | UK mobile |

## Invalid Values

| Value | Country | Reason |
|---|---|---|
| `"123"` | `US` | Too short |
| `"abc-def-ghij"` | `US` | Non-numeric |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Without `country`, accepts any string that looks like a phone number (loose validation).
- Supported countries: AE, BG, BR, CN, CZ, DE, DK, ES, FR, GB, IN, MA, NL, PK, RO, RU, SK, TH, US, VE.
