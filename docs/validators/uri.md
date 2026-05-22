# `uri` — Validare Validator

Validates that a field contains a valid URL.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    website: {
      validators: {
        uri: {
          message: 'Please enter a valid URL',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"https://example.com"` | HTTPS URL |
| `"http://sub.example.co.uk/path?q=1"` | With subdomain, path, and query |
| `"ftp://files.example.com"` | FTP URL |

## Invalid Values

| Value | Reason |
|---|---|
| `"not a url"` | No protocol |
| `"example.com"` | Missing protocol |
| `"http://"` | Missing host |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
