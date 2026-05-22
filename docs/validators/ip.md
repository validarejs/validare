# `ip` — Validare Validator

Validates that a field contains a valid IPv4 or IPv6 address.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `ipv4` | `boolean` | `true` | Accept IPv4 addresses |
| `ipv6` | `boolean` | `true` | Accept IPv6 addresses |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    serverIp: {
      validators: {
        ip: {
          ipv4: true,
          ipv6: false,
          message: 'Please enter a valid IPv4 address',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `"192.168.1.1"` | Valid IPv4 |
| `"2001:0db8:85a3:0000:0000:8a2e:0370:7334"` | Valid IPv6 |
| `"::1"` | IPv6 loopback |

## Invalid Values

| Value | Reason |
|---|---|
| `"256.1.1.1"` | Octet exceeds 255 |
| `"192.168.1"` | Only 3 octets |
| `"::gg"` | Invalid hex in IPv6 |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- Set `ipv6: false` to accept only IPv4 addresses.
- Both `ipv4` and `ipv6` default to `true` (accepts either format).
