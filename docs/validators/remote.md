# `remote` — Validare Validator

Validates a field by sending its value to a remote server and checking the response.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `url` | `string` | *required* | URL to send the validation request to |
| `method` | `"GET" \| "POST"` | `"GET"` | HTTP method |
| `data` | `Record<string, string>` | `{}` | Additional data to send with the request |
| `headers` | `Record<string, string>` | `{}` | Additional request headers |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    email: {
      validators: {
        remote: {
          url: '/api/validate-email',
          method: 'POST',
          message: 'Email is already registered',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| Server returns `{ "valid": true }` | Validation passes |

## Invalid Values

| Value | Reason |
|---|---|
| Server returns `{ "valid": false }` | Validation fails |
| Server returns `{ "valid": false, "message": "Email taken" }` | Fails with server-provided message |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- The server must return JSON: `{ "valid": true }` or `{ "valid": false, "message": "..." }`.
- For GET requests, the field value is appended as a query parameter.
- Use `Sequence` plugin to avoid sending requests until basic format validators pass.
