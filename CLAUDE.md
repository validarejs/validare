# Validare — AI Development Guide

This file provides context for AI agents working on the Validare codebase.

## Project Overview

Validare is a TypeScript form validation library inspired by FormValidation (discontinued).
It uses a plugin-based architecture with a small core engine.

**Current version:** 2.3.0 — 51 validators, 17 plugins, 818 tests.

## Reference Material

The original FormValidation source code is available in the sibling directory:
- Source: `../formvalidation-legacy/2.4.0 - source code/@form-validation/esm/`
- Examples: `../formvalidation-legacy/formvalidation-examples/`
- Docs mirror: `../formvalidation-legacy/docs/`

When implementing new validators or plugins, consult the original source first.

## Architecture

### Core Flow

```
validare(form, options)
  → Core instance
  → registers built-in validators (51)
  → calls addField() for each field (queries DOM)
  → calls registerPlugin() for each plugin (install())
  → returns Core
```

### Key Files

| File | Responsibility |
|---|---|
| `src/core/types.ts` | All shared TypeScript interfaces |
| `src/core/Emitter.ts` | Pub/sub event system |
| `src/core/Filter.ts` | Function pipeline for plugin interception |
| `src/core/Plugin.ts` | Abstract base class for all plugins |
| `src/core/Core.ts` | Main validation engine |
| `src/core/index.ts` | `validare()` factory (used by `src/index.ts`) |
| `src/index.ts` | Public entry point — registers built-in validators |
| `src/validators/` | 51 validator factories |
| `src/plugins/core/` | Core plugins (Trigger, Message, Icon, etc.) |
| `src/plugins/frameworks/` | CSS framework integrations |
| `src/locales/` | Locale data packages |

### Validator Pattern

Every validator is a zero-argument factory:

```ts
export const myValidator: ValidatorFactory = () => ({
  validate(input: ValidatorInput): ValidatorResult | Promise<ValidatorResult> {
    return { valid: someCheck(input.value) };
  },
});
```

After creating a new validator:
1. Add it to `src/validators/index.ts`
2. It will be auto-registered by `src/index.ts` (no further changes needed)

### Plugin Pattern

Every plugin extends `Plugin<OptionsType>`:

```ts
export class MyPlugin extends Plugin<MyPluginOptions> {
  private handler = (payload: unknown): void => {
    const p = payload as SomePayloadType;
    // do something with p
  };

  install(): void {
    this.core.on('core.element.validated', this.handler);
  }

  uninstall(): void {
    this.core.off('core.element.validated', this.handler);
    // clean up DOM, timers, etc.
  }
}
```

After creating a new plugin:
1. Add it to `src/plugins/index.ts`
2. Export from `src/index.ts` (already re-exports `./plugins/index`)

### Plugin Filter System

Plugins use filters to intercept Core behavior:

| Filter name | Args | Used by |
|---|---|---|
| `validate-pre` | `(Promise<void>)` | SubmitButton — blocks during validation |
| `field-should-validate` | `(bool, field, validatorName, element)` | Sequence, Excluded |
| `field-value` | `(value, field, element, validatorName)` | Transformer — transforms value per validator |
| `element-validated` | `(ElementValidatedPayload)` | Sequence — trims to first failure before rendering |

### Events Reference

| Event | Payload | When |
|---|---|---|
| `core.form.validating` | `{ instance }` | Before all fields validate |
| `core.form.valid` | `{ instance }` | All fields Valid |
| `core.form.invalid` | `{ instance }` | At least one Invalid |
| `core.form.notvalidated` | `{ instance }` | At least one NotValidated |
| `core.form.reset` | `{ instance }` | After reset() |
| `core.field.added` | `{ field, elements, options }` | addField() |
| `core.field.removed` | `{ field, elements, options }` | removeField() |
| `core.field.validating` | `{ field }` | Before field validates |
| `core.field.validated` | `{ field, result, elements }` | After field validates (any result) |
| `core.field.valid` | `{ field, elements }` | After field validates — result is Valid |
| `core.field.invalid` | `{ field, elements }` | After field validates — result is Invalid |
| `core.field.notvalidated` | `{ field, elements }` | After field validates — result is NotValidated |
| `core.element.validating` | `{ field, element, elements }` | Before each DOM element validates |
| `core.element.validated` | `ElementValidatedPayload` | After each DOM element validates |
| `core.element.ignored` | `{ field, element, elements }` | Element skipped — no active validators |
| `core.element.notvalidated` | `{ field, element, elements }` | Element result is NotValidated |
| `core.validator.validating` | `{ field, validator }` | Before each validator runs |
| `core.validator.validated` | `{ field, validator, result }` | After each validator runs |
| `core.validator.notvalidated` | `{ field, validator }` | Validator skipped or factory not found |
| `core.validator.enabled` | `{ field, validator }` | After enableValidator() |
| `core.validator.disabled` | `{ field, validator }` | After disableValidator() |

### `ElementValidatedPayload` Shape

```ts
{
  field: string;
  element: HTMLElement;
  elements: HTMLElement[];
  valid: boolean;
  result: 'Valid' | 'Invalid' | 'NotValidated';
  validators: Record<string, {
    valid: boolean;
    message: string;
    result: ValidationStatus;
  }>;
}
```

## Commands

```bash
npm test              # Run all tests
npm test -- <path>    # Run specific test file
npm run build         # Build ESM + CJS + UMD
npm run typecheck     # TypeScript type check
npm run lint          # Biome lint
npm run format        # Biome format
```

## Adding New Validators

Steps:
1. Create `src/validators/<name>.ts` following the ValidatorFactory pattern
2. Add tests in `tests/validators/<name>.test.ts`
3. Export from `src/validators/index.ts`
4. The validator is auto-registered — no Core changes needed

## Adding New Plugins

Steps:
1. Create `src/plugins/core/<Name>.ts` or `src/plugins/frameworks/<Name>.ts`
2. Add tests in `tests/plugins/<Name>.test.ts`
3. Export from `src/plugins/index.ts`
4. It becomes available as a named export from the package

## Adding New Locales

Steps:
1. Create `src/locales/<locale_code>.ts` with all validator messages
2. Export from `src/locales/index.ts`
3. Test with the existing locale test pattern in `tests/locales/locales.test.ts`

## Validators (51)

### Core (22)
`notEmpty`, `email`, `creditCard`, `date`, `digits`, `integer`, `numeric`, `regexp`, `uri`, `identical`, `different`, `between`, `greaterThan`, `lessThan`, `stringLength`, `stringCase`, `choice`, `file`, `callback`, `promise`, `remote`, `ip`

### Format & Encoding (6)
`base64`, `hex`, `mac`, `bic`, `uuid`, `color`

### Financial (6)
`iban`, `vat`, `cusip`, `isin`, `sedol`, `grid`

### Publication (4)
`ean`, `isbn`, `ismn`, `issn`

### Device & Vehicle (5)
`imei`, `imo`, `meid`, `step`, `vin`

### Tax & Business (4)
`ein`, `rtn`, `siren`, `siret`

### Identity & Geographic (4)
`id`, `phone`, `zipCode`, `blank`

## Plugins (17)

### Core (14)
| Plugin | Description |
|---|---|
| `Trigger` | Validates on DOM events |
| `Message` | Displays error messages in the DOM |
| `Icon` | Shows validation state icons next to fields |
| `SubmitButton` | Disables submit button during validation |
| `Excluded` | Skips disabled/hidden fields |
| `Sequence` | Stops at first failing validator per field |
| `Aria` | Adds `aria-invalid` / `aria-describedby` for accessibility |
| `AutoFocus` | Focuses first invalid field after failed submit |
| `PasswordStrength` | Evaluates password strength (score 0–4) |
| `Tooltip` | Displays error messages in a floating tooltip |
| `DefaultSubmit` | Submits form automatically when all fields are valid |
| `FieldStatus` | Tracks per-field validation status and fires callbacks |
| `Declarative` | Configures validators via `data-fv-*` HTML attributes |
| `CharCounter` | Displays live character counter |
| `Summary` | Renders consolidated error list in a container |
| `Dependency` | Prevents validation until dependent fields are validated |
| `StartEndDate` | Cross-validates a start/end date pair |
| `Transformer` | Intercepts and normalises field values before validation |

### CSS Frameworks (3)
| Plugin | Framework |
|---|---|
| `Bootstrap5` | Bootstrap 5 (`is-valid` / `is-invalid`) |
| `Bulma` | Bulma (`is-success` / `is-danger`) |
| `Tailwind` | Tailwind CSS (configurable utility classes) |
