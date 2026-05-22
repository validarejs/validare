# `ean` — Validare Validator

Validates an EAN (European Article Number) barcode — EAN-8 or EAN-13.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    barcode: {
      validators: {
        ean: {
          message: 'Please enter a valid EAN barcode',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"5901234123457"` | Valid EAN-13 |
| `"96385074"` | Valid EAN-8 |

## Invalid Values

| Value | Reason |
|---|---|
| `"5901234123456"` | EAN-13 with wrong check digit |
| `"12345678901"` | 11 digits — neither EAN-8 nor EAN-13 |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- EAN-8 has 8 digits; EAN-13 has 13 digits. Both use a mod-10 checksum.
