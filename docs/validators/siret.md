# `siret` — Validare Validator

Validates a SIRET (Système d'Identification du Répertoire des Établissements) number, the French establishment identifier.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    siretNumber: {
      validators: {
        siret: {
          message: 'Veuillez entrer un numéro SIRET valide',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"73207531200045"` | SIRET of a Total establishment |

## Invalid Values

| Value | Reason |
|---|---|
| `"73207531200046"` | Fails Luhn checksum |
| `"1234567890123"` | Only 13 digits instead of 14 |

## Notes

- Empty string (`""`) always returns `valid: true`. Combine with `notEmpty` to require a value.
- SIRET is 14 digits: the 9-digit SIREN + 5-digit establishment code (NIC). Validated using the Luhn algorithm.
