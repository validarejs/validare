# `uuid` — Validare Validator

Validates that a field contains a valid UUID (versions 3, 4, and 5).

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `version` | `3 \| 4 \| 5` | all versions | Restrict to a specific UUID version |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    resourceId: {
      validators: {
        uuid: {
          version: 4,
          message: 'Please enter a valid UUID',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"550e8400-e29b-41d4-a716-446655440000"` | Valid UUID v4 |
| `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` | Valid UUID v4 |

## Invalid Values

| Value | Reason |
|---|---|
| `"not-a-uuid"` | Wrong format |
| `"550e8400-e29b-61d4-a716-446655440000"` | Version digit `6` is not valid (only versions 3, 4, and 5 are supported) |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Without `version` option, UUID versions 3, 4, and 5 are accepted.
