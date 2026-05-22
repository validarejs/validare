# `issn` — Validare Validator

Validates an ISSN (International Standard Serial Number) used to identify periodicals.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    journalIssn: {
      validators: {
        issn: {
          message: 'Please enter a valid ISSN',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"0028-0836"` | Nature journal ISSN |
| `"1476-4687"` | Nature online ISSN |

## Invalid Values

| Value | Reason |
|---|---|
| `"0028-0837"` | Wrong check digit |
| `"12345678"` | Missing hyphen |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Format: 4 digits, hyphen, 3 digits, check character (digit or `X`): `NNNN-NNNC`.
