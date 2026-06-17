# Migrating from FormValidation to Validare

Validare is a modern rewrite of FormValidation, with a near-identical API. Most code migrates with a find-and-replace of the import path. This document covers the four cases where behavior changed.

---

## 1. `blank` validator — completely different semantics

**FormValidation:** `blank` always returns `valid: true`. It was designed as a placeholder to display custom messages returned from a server (the message came from outside, validation was irrelevant).

**Validare:** `blank` validates that the field **is empty** — the logical opposite of `notEmpty`.

### If you used `blank` to show server messages

Replace it with a `callback` that always returns valid, and set the message dynamically via `fv.updateFieldStatus()`:

```js
// Before (FormValidation)
fields: {
  username: {
    validators: {
      blank: { message: 'This username is already taken' },
    },
  },
}

// After (Validare) — use callback + updateFieldStatus from server response
fields: {
  username: {
    validators: {
      notEmpty: {},
      serverCheck: {
        callback: () => ({ valid: true }), // always passes client-side
        message: '',
      },
    },
  },
}

// Then after the server responds:
fetch('/api/check-username?value=' + value)
  .then(r => r.json())
  .then(({ available, message }) => {
    fv.updateFieldStatus('username', available ? 'Valid' : 'Invalid', 'serverCheck');
  });
```

### If you want to validate that a field is empty

`blank` now does exactly this — no changes needed.

```js
fields: {
  honeypot: {
    validators: {
      blank: { message: 'Bot detected' },
    },
  },
}
```

---

## 2. `creditCard` validator — card type detection removed

**FormValidation:** Validated card number format (prefix + length) for each card network (Visa, Mastercard, Amex, Discover, etc.) in addition to the Luhn checksum.

**Validare:** Validates only the Luhn checksum. Any number with a valid checksum passes, regardless of network.

### If you need to detect the card network

Use a `callback` validator after `creditCard`:

```js
fields: {
  cardNumber: {
    validators: {
      notEmpty: {},
      creditCard: { message: 'Invalid card number' },
      cardType: {
        callback: (input) => {
          const value = input.value.replace(/[\s-]/g, '');
          const types = {
            visa:       /^4[0-9]{12}(?:[0-9]{3})?$/,
            mastercard: /^5[1-5][0-9]{14}$/,
            amex:       /^3[47][0-9]{13}$/,
            discover:   /^6(?:011|5[0-9]{2})[0-9]{12}$/,
          };
          const detected = Object.keys(types).find(t => types[t].test(value));
          return {
            valid: !!detected,
            message: detected ? '' : 'Card network not supported',
          };
        },
      },
    },
  },
}
```

### If you only need Luhn validation

No changes needed — `creditCard` in Validare behaves like FormValidation for purely numeric Luhn checks.

---

## 3. `date` validator — no time support

**FormValidation:** Supported full datetime strings including hours, minutes, seconds, and AM/PM (e.g. `MM/DD/YYYY hh:mm:ss A`).

**Validare:** Supports date-only formats (`MM/DD/YYYY`, `YYYY-MM-DD`, etc.).

### If you need to validate a datetime

Split the validation into two fields, or use a `callback`:

```js
// Option A — two separate fields
fields: {
  eventDate: {
    validators: {
      date: { format: 'YYYY-MM-DD', message: 'Invalid date' },
    },
  },
  eventTime: {
    validators: {
      regexp: {
        regexp: /^([01]\d|2[0-3]):([0-5]\d)$/,
        message: 'Invalid time — use HH:MM',
      },
    },
  },
}

// Option B — single datetime-local input via callback
fields: {
  eventDatetime: {
    validators: {
      callback: {
        callback: (input) => {
          const d = new Date(input.value);
          return { valid: !isNaN(d.getTime()), message: 'Invalid date and time' };
        },
      },
    },
  },
}
```

### If you only validate dates (no time component)

No changes needed.

---

## 4. `email` validator — no `multiple` or `requireGlobalDomain` options

**FormValidation:** Supported `multiple: true` to validate comma-separated lists of emails, a configurable separator, and `requireGlobalDomain: true` to reject addresses without a TLD (e.g. `user@localhost`).

**Validare:** Validates a single email address only.

### If you need to validate multiple emails

Use a `callback`:

```js
fields: {
  recipients: {
    validators: {
      callback: {
        callback: (input) => {
          const EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          const emails = input.value.split(',').map(e => e.trim()).filter(Boolean);
          const allValid = emails.length > 0 && emails.every(e => EMAIL.test(e));
          return { valid: allValid, message: 'One or more email addresses are invalid' };
        },
      },
    },
  },
}
```

### If you used `requireGlobalDomain: true`

Use a `callback` with a stricter regex:

```js
fields: {
  email: {
    validators: {
      callback: {
        callback: (input) => {
          // Requires at least one dot in the domain part
          const STRICT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          return { valid: STRICT.test(input.value), message: 'Please enter a valid email address' };
        },
      },
    },
  },
}
```

### If you validate a single email without those options

No changes needed.

---

## Quick reference

| Situation | Action |
|---|---|
| Used `blank` to show server messages | Replace with `callback: () => ({ valid: true })` + `updateFieldStatus()` |
| Used `blank` to assert field is empty | No change — same behavior |
| Need card network detection | Add a `callback` validator after `creditCard` |
| Only need Luhn checksum | No change |
| Validate date + time in one field | Use `callback` with `new Date()` |
| Validate date only | No change |
| Validate multiple emails | Replace `email: { multiple: true }` with a `callback` |
| Validate single email | No change |
