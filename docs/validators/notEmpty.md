# `notEmpty` — Validare Validator

Validates that a field is not empty.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `trim` | `boolean` | `false` | If `true`, trims whitespace before checking — `"   "` becomes invalid |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    username: {
      validators: {
        notEmpty: {
          trim: true,
          message: 'Username is required',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"hello"` | Non-empty string |
| `"0"` | The string `"0"` is non-empty |
| `" hello "` | Whitespace around content |

## Invalid Values

| Value | Reason |
|---|---|
| `""` | Empty string |
| `"   "` | Whitespace only (when `trim: true`) |

## Notes

- Unlike all other validators, `notEmpty` returns `valid: false` for empty string.
- Use with `trim: true` if you want to reject values that are only spaces.
