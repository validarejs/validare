# Validare — AI Development Guide

This file provides context for AI agents working on the Validare codebase.

## Project Overview

Validare is a TypeScript form validation library inspired by FormValidation (discontinued).
It uses a plugin-based architecture with a small core engine.

## Reference Material

The original FormValidation source code is available in the sibling directory:
- Source: `../formvalidation-legacy/2.4.0 - source code/@form-validation/esm/`
- Examples: `../formvalidation-legacy/formvalidation-examples/`
- Docs mirror: `../formvalidation-legacy/docs/`
- Design spec: `docs/superpowers/specs/2026-05-20-validare-design.md`
- Implementation plans: `docs/superpowers/plans/`

When implementing new validators or plugins, consult the original source first.

## Architecture

### Core Flow

```
validare(form, options)
  → Core instance
  → registers built-in validators (22)
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
| `src/validators/` | 22 validator factories |
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
| `core.field.validated` | `{ field, result, elements }` | After field validates |
| `core.element.validated` | `ElementValidatedPayload` | After each DOM element validates |
| `core.validator.validated` | `{ field, validator, result }` | After each validator runs |

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

## Adding New Validators (v2 backlog)

See `../docs/superpowers/specs/2026-05-20-validare-design.md` — Roadmap section.

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
1. Create `src/locales/<locale_code>.ts` with all 22 validator messages
2. Export from `src/locales/index.ts`
3. Test with the existing locale test pattern in `tests/locales/locales.test.ts`
