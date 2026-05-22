# `stringCase` — Validare Validator

Validates that a string is entirely uppercase or entirely lowercase.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `case` | `"upper" \| "lower"` | *required* | The required case |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    countryCode: {
      validators: {
        stringCase: {
          case: 'upper',
          message: 'Country code must be uppercase (e.g. US, BR)',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"HELLO"` | All uppercase (case=upper) |
| `"hello"` | All lowercase (case=lower) |

## Invalid Values

| Value | Reason |
|---|---|
| `"hello"` | Lowercase when `case: "upper"` |
| `"Hello"` | Mixed case |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- Non-letter characters (digits, symbols) are ignored in the case check.
