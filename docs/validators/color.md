# `color` — Validare Validator

Validates that a field contains a valid CSS color value.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | `string \| string[]` | all | Accepted color format(s): `"hex"`, `"rgb"`, `"rgba"`, `"hsl"`, `"hsla"`, `"keyword"`, or `"all"` |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    themeColor: {
      validators: {
        color: {
          type: ['hex', 'rgb'],
          message: 'Please enter a hex or rgb color',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"#FF5733"` | Hex color |
| `"rgb(255, 87, 51)"` | RGB |
| `"hsl(9, 100%, 60%)"` | HSL |
| `"red"` | CSS color keyword |

## Invalid Values

| Value | Reason |
|---|---|
| `"notacolor"` | Not a recognized CSS color format |
| `"#GGHHII"` | Invalid hex digits |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- `type` can be a single string (`"hex"`) or an array (`["hex", "rgb"]`).
