# `Icon` Plugin

Shows a validation state icon (valid, invalid, or validating) next to each field.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `valid` | `string` | `"✓"` | Content of the icon when the field is valid |
| `invalid` | `string` | `"✗"` | Content of the icon when the field is invalid |
| `validating` | `string` | `"…"` | Content of the icon while validation is running |

## Usage

```js
import { validare, Icon } from 'validare';

const fv = validare(form, {
  plugins: {
    icon: new Icon({
      valid: '✓',
      invalid: '✗',
      validating: '⟳',
    }),
  },
  fields: { /* ... */ },
});
```

## Notes

- Icons are rendered as `<span>` elements inserted after each validated field element.
- The `valid`, `invalid`, and `validating` values are set as `textContent`. Plain Unicode characters work correctly. SVG markup and HTML entity syntax are NOT interpreted — use actual Unicode characters (e.g., `"✓"` not `"&check;"`).
- The `validating` option is reserved but not yet implemented — no icon state change occurs while validation is in progress.
- On `uninstall()`, all icon elements are removed from the DOM.
