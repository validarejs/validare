# `identical` — Validare Validator

Validates that a field's value is equal to another field's value (or a fixed string).

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `compare` | `string` | *required* | Field name to compare against, or a fixed value |
| `trim` | `boolean` | `false` | Trim whitespace from both values before comparing |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    password: {
      validators: { notEmpty: {} },
    },
    confirmPassword: {
      validators: {
        identical: {
          compare: 'password',
          message: 'Passwords do not match',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| Same as the `password` field | Values match |

## Invalid Values

| Value | Reason |
|---|---|
| Different from the `password` field | Values do not match |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` if the field is required.
- `compare` can be a field name (resolved at validation time) or a fixed string literal.
