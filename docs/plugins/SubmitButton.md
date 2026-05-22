# `SubmitButton` Plugin

Disables the form's submit button while validation is in progress to prevent double-submission.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `selector` | `string` | `'[type="submit"]'` | CSS selector for the button(s) to disable during validation |

## Usage

```js
import { validare, SubmitButton } from 'validare';

const fv = validare(form, {
  plugins: {
    submitButton: new SubmitButton(),
  },
  fields: { /* ... */ },
});
```

## Notes

- The button is disabled at the start of validation (`core.form.validating`) and re-enabled when validation completes.
- To target a specific button, set `selector: '#my-submit-btn'`.
- On `uninstall()`, the button is re-enabled regardless of validation state.
