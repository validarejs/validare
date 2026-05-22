# `iban` — Validare Validator

Validates an International Bank Account Number (IBAN) for 77 countries.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `country` | `string` | `undefined` | Restrict to a specific country code (e.g. `"DE"`) |
| `sepa` | `boolean \| string` | `undefined` | If `true`, restrict to SEPA countries; if a string, treated as a country code |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    iban: {
      validators: {
        iban: {
          message: 'Please enter a valid IBAN',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Country |
|---|---|
| `"DE89370400440532013000"` | Germany |
| `"GB29NWBK60161331926819"` | United Kingdom |
| `"FR7614508059009054924040816"` | France |

## Invalid Values

| Value | Reason |
|---|---|
| `"DE89370400440532013001"` | Wrong mod-97 checksum |
| `"XX89370400440532013000"` | Unknown country code |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- Without `country` option, accepts IBANs from all 77 supported countries.
- With `sepa: true`, only accepts IBANs from the 36 SEPA member countries.
