# `isbn` — Validare Validator

Validates an ISBN (International Standard Book Number) — ISBN-10 or ISBN-13.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    bookIsbn: {
      validators: {
        isbn: {
          message: 'Please enter a valid ISBN',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"978-0-306-40615-2"` | Valid ISBN-13 with hyphens |
| `"0-306-40615-2"` | Valid ISBN-10 with hyphens |
| `"9780306406157"` | Valid ISBN-13 without hyphens |

## Invalid Values

| Value | Reason |
|---|---|
| `"978-0-306-40615-3"` | Wrong check digit |
| `"12345"` | Too short |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Accepts both ISBN-10 (10 digits) and ISBN-13 (978- or 979- prefix, 13 digits).
- Hyphens are optional and ignored during validation.
