# `promise` — Validare Validator

Validates a field using a custom asynchronous function.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `promise` | `(input: ValidatorInput) => Promise<{ valid: boolean, message?: string }>` | *required* | Custom async validation function |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    username: {
      validators: {
        promise: {
          message: 'Username already taken',
          promise: async (input) => {
            const res = await fetch(`/api/check?username=${input.value}`);
            const data = await res.json();
            return { valid: data.available };
          },
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| Promise resolves `{ valid: true }` | Validation passes |

## Invalid Values

| Value | Reason |
|---|---|
| Promise resolves `{ valid: false }` | Validation fails with default or inline message |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- Same `input` object as `callback`: `value`, `elements`, `options`, `field`.
- For synchronous checks, use `callback` instead.
- Rejection (thrown error) is treated as invalid.
