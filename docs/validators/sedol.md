# `sedol` — Validare Validator

Validates a SEDOL (Stock Exchange Daily Official List) number used by the London Stock Exchange.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    sedol: {
      validators: {
        sedol: {
          message: 'Please enter a valid SEDOL number',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"0263494"` | Valid SEDOL |
| `"B0WNLY7"` | Alphanumeric SEDOL |

## Invalid Values

| Value | Reason |
|---|---|
| `"0263495"` | Fails check digit |
| `"12345"` | Too short |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- SEDOL is 7 characters: 6 alphanumeric + 1 check digit.
