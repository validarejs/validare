# `Excluded` Plugin

Skips validation for fields that are disabled, hidden, or match a custom exclusion function.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `excluded` | `string \| ((field: string, element: HTMLElement) => boolean)` | built-in rules | Custom exclusion rule. A CSS selector string or a function returning `true` to exclude the field. |

## Usage

```js
import { validare, Excluded } from 'validare';

// Default: excludes [disabled] and [style*="display: none"] elements
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

- By default, always excludes elements that are `[disabled]` or have `style="display: none"`.
- The custom `excluded` function runs in addition to the built-in rules (it does not replace them).
- Compatible with `Sequence` — excluded fields do not count as failures.
