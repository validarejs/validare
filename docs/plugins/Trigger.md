# `Trigger` Plugin

Attaches DOM event listeners to form fields and triggers validation when they fire.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `event` | `string \| Record<string, string \| false>` | `"input"` | DOM event name(s) to listen to. Use a record to set per-field events. Set to `false` to disable a field. |
| `delay` | `number` | `0` | Debounce delay in milliseconds before triggering validation |

## Usage

```js
import { validare, Trigger } from 'validare';

const fv = validare(form, {
  plugins: {
    trigger: new Trigger({
      event: 'blur',  // validate on blur for all fields
      delay: 300,
    }),
  },
  fields: { /* ... */ },
});
```

## Per-Field Events

```js
new Trigger({
  event: {
    email: 'blur',      // validate email on blur
    password: 'input',  // validate password on every keystroke
    username: false,    // disable auto-trigger for username
  },
})
```

## Notes

- Without `Trigger`, validation only runs when you call `fv.validate()` or `fv.validateField()` manually.
- `delay` debounces the handler — useful for fields like `remote` that make network requests.
- Events are attached on `core.field.added` and cleaned up on `core.field.removed`.
