# `bic` — Validare Validator

Validates that a field contains a valid BIC (Bank Identifier Code) / SWIFT code.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    swiftCode: {
      validators: {
        bic: {
          message: 'Please enter a valid BIC/SWIFT code',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"DEUTDEFF"` | Deutsche Bank Frankfurt (8 chars) |
| `"BNPAFRPPXXX"` | BNP Paribas Paris (11 chars with branch) |

## Invalid Values

| Value | Reason |
|---|---|
| `"INVALID"` | Does not match BIC format |
| `"DEUT1234"` | Digits in bank/country code positions |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- BIC is either 8 characters (no branch) or 11 characters (with branch code).
