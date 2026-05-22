# `different` — Validare Validator

Validates that a field's value is different from another field's value (or a fixed string).

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
    currentPassword: {
      validators: { notEmpty: {} },
    },
    newPassword: {
      validators: {
        different: {
          compare: 'currentPassword',
          message: 'New password must be different from current password',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| Different from the `currentPassword` field | Values differ |

## Invalid Values

| Value | Reason |
|---|---|
| Same as the `currentPassword` field | Values match |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` if the field is required.
- `compare` can be a field name or a fixed string literal.
