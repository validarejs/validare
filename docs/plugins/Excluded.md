# `Excluded` Plugin

Skips validation for fields that are disabled, hidden, or match a custom exclusion function.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `excluded` | `string \| ((field: string, element: HTMLElement) => boolean)` | built-in rules | Custom exclusion rule. A CSS selector string or a function returning `true` to exclude the field. |

## Usage

```js
import { validare, Excluded } from 'validare';

// Default: excludes [disabled] and [type="hidden"] elements
const fv = validare(form, {
  plugins: {
    excluded: new Excluded(),
  },
  fields: { /* ... */ },
});

// Custom function: also exclude fields with [data-skip] attribute
const fv2 = validare(form, {
  plugins: {
    excluded: new Excluded({
      excluded: (field, element) => element.hasAttribute('data-skip'),
    }),
  },
  fields: { /* ... */ },
});
```

## Notes

- By default, always excludes elements that have the `disabled` attribute or `type="hidden"`.
- The custom `excluded` function is evaluated after the built-in disabled/hidden check. If the built-in check already excludes the field, the custom function is not called.
- Compatible with `Sequence` — excluded fields do not count as failures.
