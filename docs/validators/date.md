# `date` — Validare Validator

Validates that a field contains a date matching a specified format.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `format` | `string` | `"MM/DD/YYYY"` | Date format using `DD` (day), `MM` (month), `YYYY` (4-digit year) |
| `min` | `string` | `undefined` | Minimum date (same format as `format`) |
| `max` | `string` | `undefined` | Maximum date (same format as `format`) |
| `separator` | `string` | auto-detected | Character separating date parts |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    birthDate: {
      validators: {
        date: {
          format: 'DD/MM/YYYY',
          message: 'Please enter a valid date (DD/MM/YYYY)',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"12/25/2025"` | MM/DD/YYYY (default format) |
| `"25/12/2025"` | DD/MM/YYYY (with `format: "DD/MM/YYYY"`) |

## Invalid Values

| Value | Reason |
|---|---|
| `"25/12/2025"` | Day/month swapped (default MM/DD/YYYY) |
| `"13/32/2025"` | Month 13 or day 32 do not exist |
| `"2025-12-25"` | Wrong separator for default format |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- Separator is auto-detected from the format string unless explicitly set.
- Leap years are validated correctly.
