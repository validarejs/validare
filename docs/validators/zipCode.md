# `zipCode` — Validare Validator

Validates a postal/ZIP code for a specified country.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `country` | `string` | `undefined` | ISO 3166-1 alpha-2 country code |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    postalCode: {
      validators: {
        zipCode: {
          country: 'US',
          message: 'Please enter a valid ZIP code',
        },
      },
    },
  },
});
```

## Valid Values by Country (examples)

| Country | Value | Notes |
|---|---|---|
| `US` | `"10001"` | New York ZIP code |
| `DE` | `"10115"` | Berlin postal code |
| `GB` | `"SW1A 1AA"` | London postal code |
| `CA` | `"K1A 0A9"` | Ottawa postal code |

## Invalid Values

| Value | Country | Reason |
|---|---|---|
| `"AAAAA"` | `DE` | Not digits |
| `"1234"` | `US` | Only 4 digits instead of 5 |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Without `country`, returns `valid: true` for any value (pass-through).
- Supported countries: AT, BG, BR, CA, CH, CZ, DE, DK, ES, FR, GB, IE, IN, IT, MA, NL, PL, PT, RO, RU, SE, SG, SK, US.
