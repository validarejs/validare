# `Message` Plugin

Displays validation error messages in the DOM next to each field.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `container` | `string` | `undefined` | CSS selector for a single container to display all messages. Without this, a `<div>` is inserted after each field. |
| `clazz` | `string` | `"fv-plugins-message-container"` | CSS class applied to each message container element |

## Usage

```js
import { validare, Trigger, Message } from 'validare';

const fv = validare(form, {
  plugins: {
    trigger: new Trigger({ event: 'blur' }),
    message: new Message(),
  },
  fields: {
    email: {
      validators: {
        notEmpty: { message: 'Email is required' },
        email: { message: 'Invalid email format' },
      },
    },
  },
});
```

## Notes

- Without `container`, a `<div class="fv-plugins-message-container">` is inserted immediately after each validated field element.
- With `container: '#errors'`, per-field message divs are inserted inside that container instead of after each field element.
- On `uninstall()` (e.g., `fv.destroy()`), all injected message elements are removed from the DOM.
