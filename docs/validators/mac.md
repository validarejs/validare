# `mac` — Validare Validator

Validates that a field contains a valid MAC address.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    macAddress: {
      validators: {
        mac: {
          message: 'Please enter a valid MAC address',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"01:23:45:67:89:ab"` | Colon-separated, lowercase |
| `"01-23-45-67-89-AB"` | Hyphen-separated, uppercase |

## Invalid Values

| Value | Reason |
|---|---|
| `"ZZ:ZZ:ZZ:ZZ:ZZ:ZZ"` | `Z` is not a hex digit |
| `"01:23:45:67:89"` | Only 5 groups instead of 6 |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
