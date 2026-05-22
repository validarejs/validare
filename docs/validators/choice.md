# `choice` — Validare Validator

Validates that the number of selected checkboxes in a group is within a specified range.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `min` | `number` | `undefined` | Minimum number of checkboxes that must be checked |
| `max` | `number` | `undefined` | Maximum number of checkboxes that can be checked |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    interests: {
      validators: {
        choice: {
          min: 1,
          max: 3,
          message: 'Please select between 1 and 3 interests',
        },
      },
    },
  },
});
```

```html
<input type="checkbox" name="interests" value="sports" />
<input type="checkbox" name="interests" value="music" />
<input type="checkbox" name="interests" value="travel" />
<input type="checkbox" name="interests" value="food" />
```

## Valid Values

| Value | Notes |
|---|---|
| 2 checkboxes checked | Within min=1, max=3 |
| 1 checkbox checked | Equal to min |

## Invalid Values

| Value | Reason |
|---|---|
| 0 checkboxes checked | Below min=1 |
| 4 checkboxes checked | Exceeds max=3 |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- Applies to groups of checkboxes sharing the same `name` attribute.
