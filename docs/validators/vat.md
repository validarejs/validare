# `vat` — Validare Validator

Validates a VAT (Value Added Tax) number for one of 38 supported countries.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `country` | `string` | `undefined` | ISO 3166-1 alpha-2 country code (e.g. `"DE"`, `"BR"`, `"FR"`) |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    vatNumber: {
      validators: {
        vat: {
          country: 'DE',
          message: 'Bitte geben Sie eine gültige Umsatzsteuer-ID ein',
        },
      },
    },
  },
});
```

## Valid Values by Country (examples)

| Country | Value | Notes |
|---|---|---|
| `DE` | `"DE123456789"` | German USt-IdNr |
| `BR` | `"11222333000181"` | Brazilian CNPJ |
| `FR` | `"FR40303265045"` | French TVA |
| `GB` | `"GB980780684"` | UK VAT |

## Invalid Values

| Value | Country | Reason |
|---|---|---|
| `"DE000000000"` | `DE` | Fails weighted checksum |
| `"FR00000000000"` | `FR` | Invalid key digits |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Unknown or omitted `country` returns `valid: true` (pass-through).
- Supported countries: AR, AT, BE, BG, BR, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IS, IT, LT, LU, LV, MT, NL, NO, PL, PT, RO, RS, RU, SE, SI, SK, VE, ZA.
