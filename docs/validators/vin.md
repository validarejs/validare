# `vin` — Validare Validator

Validates a VIN (Vehicle Identification Number) for USA vehicles.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    vehicleVin: {
      validators: {
        vin: {
          message: 'Please enter a valid VIN',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"1HGBH41JXMN109186"` | Valid Honda VIN |

## Invalid Values

| Value | Reason |
|---|---|
| `"1HGBH41JXMN109187"` | Fails check digit |
| `"1HGBH41JXMN10918"` | Only 16 chars instead of 17 |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- VIN is exactly 17 alphanumeric characters. Letters I, O, and Q are not used.
- The 9th character is a check digit validated using a weighted sum algorithm.
