# `ein` — Validare Validator

Validates a US EIN (Employer Identification Number), also known as a Federal Tax ID.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    taxId: {
      validators: {
        ein: {
          message: 'Please enter a valid EIN (XX-XXXXXXX)',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"12-3456789"` | Standard EIN format with hyphen |
| `"123456789"` | EIN without hyphen |

## Invalid Values

| Value | Reason |
|---|---|
| `"99-9999999"` | Prefix `99` is not assigned |
| `"00-0000000"` | All-zero EIN is invalid |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Format: two-digit prefix + hyphen + seven digits (`XX-XXXXXXX`).
- Certain prefix codes (00, 07, 08, 09, 17, 18, 19, 28, 29, 49, 69, 70, 78, 79, 89, 96, 97) are not assigned.
