# `file` — Validare Validator

Validates file input constraints: allowed extensions, file size, and number of files.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `extension` | `string` | `undefined` | Comma-separated allowed extensions without dots (e.g. `"pdf,jpg,png"`) |
| `maxSize` | `number` | `undefined` | Maximum file size in bytes |
| `minFiles` | `number` | `undefined` | Minimum number of files |
| `maxFiles` | `number` | `undefined` | Maximum number of files |
| `message` | `string` | locale default | Custom error message |

## Usage

```js
const fv = validare(form, {
  fields: {
    avatar: {
      validators: {
        file: {
          extension: 'jpg,jpeg,png,gif',
          maxSize: 5 * 1024 * 1024,  // 5 MB
          message: 'Please upload an image under 5 MB',
        },
      },
    },
  },
});
```

## Valid Values

| Value | Notes |
|---|---|
| `.jpg` file under 5 MB | Extension and size within limits |
| `.jpeg` file | Matches allowed extensions |

## Invalid Values

| Value | Reason |
|---|---|
| `.exe` file | Extension not in allowed list |
| 10 MB `.jpg` | Exceeds `maxSize` |

## Notes

- Empty string (`""`) always returns `valid: true` — validators only run on non-empty values. Combine with `notEmpty` to require a value.
- `extension` is comma-separated without dots: `"pdf,jpg,png"`.
- `maxSize` is in bytes: `5 * 1024 * 1024` for 5 MB.
