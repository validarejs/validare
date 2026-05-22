# `creditCard` — Validare Validator

Validates a credit card number using the Luhn checksum algorithm.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    cardNumber: {
      validators: {
        creditCard: {
          message: 'Please enter a valid credit card number',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"4532015112830366"` | Visa |
| `"5425233430109903"` | Mastercard |
| `"378282246310005"` | American Express |

## Invalid Values

| Value | Reason |
|---|---|
| `"4532015112830367"` | Fails Luhn checksum |
| `"1234567890123456"` | Not a valid card number |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- Accepts digits with or without spaces/hyphens.
