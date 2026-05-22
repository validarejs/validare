# `id` — Validare Validator

Validates a national identification number for one of 42 supported countries.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `country` | `string` | `undefined` | ISO 3166-1 alpha-2 country code (e.g. `"BR"`, `"DE"`, `"ES"`) |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    cpf: {
      validators: {
        id: {
          country: 'BR',
          message: 'Por favor, insira um CPF válido',
        },
      },
    },
  },
});
```

## Valid Values by Country (examples)

| Country | Value | Notes |
|---|---|---|
| `BR` | `"231.002.999-81"` | Brazilian CPF |
| `DE` | `"85055201671"` | German Personalausweis |
| `ES` | `"99999999R"` | Spanish DNI |
| `FR` | `"195017530058990"` | French NIR |
| `US` | — | Not supported |

## Invalid Values

| Value | Country | Reason |
|---|---|---|
| `"000.000.000-00"` | `BR` | All-zeros CPF |
| `"99999999X"` | `ES` | Wrong check letter |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Unknown or omitted `country` returns `valid: true` (pass-through).
- Supported countries: AR, BA, BG, BR, CH, CL, CN, CO, CZ, DK, EE, ES, FI, FR, HK, HR, ID, IE, IL, IS, KR, LT, LV, ME, MK, MX, MY, NL, NO, PE, PL, RO, RS, SE, SI, SK, SM, TH, TR, TW, UY, ZA.
- EE (Estonia) uses the Lithuanian algorithm. SK (Slovakia) uses the Czech algorithm.
