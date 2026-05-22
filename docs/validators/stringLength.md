# `stringLength` — Validare Validator

Validates that a string's length is within specified minimum and maximum bounds.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `min` | `number` | `undefined` | Minimum number of characters |
| `max` | `number` | `undefined` | Maximum number of characters |
| `trim` | `boolean` | `false` | Trim whitespace before measuring length |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    username: {
      validators: {
        stringLength: {
          min: 3,
          max: 20,
          message: 'Username must be between 3 and 20 characters',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"hello"` | 5 characters — within min=1, max=10 |
| `"ab"` | 2 characters — with min=1, max=10 |

## Invalid Values

| Value | Reason |
|---|---|
| `""` | 0 characters — below min=1 |
| `"toolongstring"` | Exceeds max |

## Notes

- Empty string (`""`) always returns `valid: true` (unless `min` is set and greater than 0).
- Combine with `notEmpty` to explicitly require a non-empty value.
