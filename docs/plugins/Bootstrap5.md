# `Bootstrap5` Plugin

Applies Bootstrap 5 validation classes (`is-valid` / `is-invalid`) to form fields based on their validation state.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `validClass` | `string` | `"is-valid"` | CSS class applied when the field is valid |
| `invalidClass` | `string` | `"is-invalid"` | CSS class applied when the field is invalid |

## Usage

```js
import { validare, Trigger, Message, Bootstrap5 } from 'validare';

const fv = validare(form, {
  plugins: {
    trigger: new Trigger({ event: 'blur' }),
    message: new Message(),
    ui: new Bootstrap5(),
  },
  fields: {
    email: {
      validators: { notEmpty: {}, email: {} },
    },
  },
});
```

## Required Bootstrap 5 Markup

```html
<div class="mb-3">
  <label for="email" class="form-label">Email</label>
  <input type="email" class="form-control" id="email" name="email" />
  <div class="invalid-feedback"><!-- Message plugin injects here --></div>
</div>
```

## Notes

- Classes are added directly to the `<input>` element (not the wrapper `<div>`).
- The `Message` plugin is recommended alongside `Bootstrap5` to display error text.
- On `uninstall()` (e.g., `fv.destroy()`), all classes are removed.
