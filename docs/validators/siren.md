# `siren` — Validare Validator

Validates a SIREN (Système d'Identification du Répertoire des Entreprises) number, the French company identifier.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    sirenNumber: {
      validators: {
        siren: {
          message: 'Veuillez entrer un numéro SIREN valide',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"732075312"` | SIREN of Total S.A. |
| `"552032534"` | SIREN of Air France |

## Invalid Values

| Value | Reason |
|---|---|
| `"732075313"` | Fails Luhn checksum |
| `"12345678"` | Only 8 digits instead of 9 |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- SIREN is exactly 9 digits, validated using the Luhn algorithm.
