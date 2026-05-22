# `Tailwind` Plugin

Applies Tailwind CSS utility classes to form fields based on their validation state.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `validClass` | `string` | `""` | Space-separated Tailwind classes applied when the field is valid |
| `invalidClass` | `string` | `""` | Space-separated Tailwind classes applied when the field is invalid |

## Usage

```js
import { validare, Trigger, Message, Tailwind } from 'validare';

const fv = validare(form, {
  plugins: {
    trigger: new Trigger({ event: 'blur' }),
    message: new Message(),
    ui: new Tailwind({
      validClass: 'border-green-500 ring-green-500',
      invalidClass: 'border-red-500 ring-red-500',
    }),
  },
  fields: {
    email: {
      validators: { notEmpty: {}, email: {} },
    },
  },
});
```

## Notes

- Both `validClass` and `invalidClass` default to `""` — you must provide class names for the plugin to have any visual effect.
- Supports multiple space-separated classes: `"ring-2 ring-green-500 border-green-500"`.
- Classes are added to the `<input>` element directly.
- On `uninstall()`, all validation classes are removed.
