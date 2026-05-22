# `ismn` — Validare Validator

Validates an ISMN (International Standard Music Number).

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    sheetMusicId: {
      validators: {
        ismn: {
          message: 'Please enter a valid ISMN',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"M-2306-7118-7"` | Valid ISMN-10 |
| `"979-0-2600-0043-8"` | Valid ISMN-13 |

## Invalid Values

| Value | Reason |
|---|---|
| `"M-230-22107-9"` | Wrong check character |
| `"INVALID"` | Does not match ISMN format |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- ISMN identifies printed music publications. It starts with `M` (legacy) or `979-0` (ISMN-13).
