# `Sequence` Plugin

Stops running validators for a field as soon as one fails, preventing unnecessary checks.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Enable or disable sequential validation |

## Usage

```js
import { validare, Sequence } from 'validare';

const fv = validare(form, {
  plugins: {
    sequence: new Sequence({ enabled: true }),
  },
  fields: {
    email: {
      validators: {
        notEmpty: { message: 'Email is required' },
        email: { message: 'Invalid email format' },
        remote: { url: '/api/check-email', message: 'Email already taken' },
      },
    },
  },
});
// If notEmpty fails → email and remote validators do NOT run.
// If notEmpty passes but email fails → remote does NOT run.
```

## Notes

- Without `Sequence`, all validators run in parallel regardless of earlier failures.
- Particularly useful to prevent unnecessary `remote` requests when basic format validation fails.
- Uses the `field-should-validate` filter internally; compatible with `Excluded`.
