# `Bulma` Plugin

Applies Bulma validation classes (`is-success` / `is-danger`) to form fields based on their validation state.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `validClass` | `string` | `"is-success"` | CSS class applied when the field is valid |
| `invalidClass` | `string` | `"is-danger"` | CSS class applied when the field is invalid |

## Usage

```js
import { validare, Trigger, Message, Bulma } from 'validare';

const fv = validare(form, {
  plugins: {
    trigger: new Trigger({ event: 'blur' }),
    message: new Message(),
    ui: new Bulma(),
  },
  fields: {
    email: {
      validators: { notEmpty: {}, email: {} },
    },
  },
});
```

## Required Bulma Markup

```html
<div class="field">
  <div class="control">
    <input class="input" type="email" name="email" />
    <p class="help is-danger"><!-- Message plugin injects here --></p>
  </div>
</div>
```

## Notes

- Classes are added directly to the `<input>` element.
- The `Message` plugin is recommended alongside `Bulma` to display error text.
- On `uninstall()`, all validation classes are removed.
