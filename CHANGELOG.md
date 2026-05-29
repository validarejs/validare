# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.3.0] — 2026-05-29

### Added

- **`core.field.valid` / `core.field.invalid` / `core.field.notvalidated` events** — Fired after `core.field.validated`, providing convenience shortcuts for reacting to a specific field outcome without inspecting the payload.
- **`core.element.validating` event** — Fired before each DOM element begins validation.
- **`core.element.ignored` event** — Fired when an element is skipped because it has no active validators.
- **`core.element.notvalidated` event** — Fired when an element's validation result is `NotValidated`.
- **`core.validator.validating` event** — Fired before each individual validator runs.
- **`core.validator.notvalidated` event** — Fired when a validator is skipped or its factory is not registered.
- **`core.validator.enabled` / `core.validator.disabled` events** — Fired by `enableValidator()` and `disableValidator()` respectively.
- **`blank` validator** — Validates that a field is empty. The opposite of `notEmpty`. Supports the same `trim` option.
- **`CharCounter` plugin** — Displays a live character counter inside a `.fv-plugins-char-counter` container element. Updates on every keystroke and adds a configurable CSS class when the count exceeds `max`.

---

## [2.2.0] — 2026-05-28

### Added

- **Aria plugin** — Adds `aria-invalid` and `aria-describedby` attributes automatically, linking error containers to their fields for screen-reader accessibility.
- **AutoFocus plugin** — Moves focus to the first invalid field after a failed form validation. Supports an `onPrefocus` callback for custom focus logic.
- **PasswordStrength plugin** — Evaluates password strength on a 0–4 scale (length, uppercase, digit, special character) and rejects passwords below a configurable minimum score.
- **Tooltip plugin** — Displays validation error messages in a floating tooltip instead of an inline `<div>`. Supports `hover` (default) and `click` triggers and four placements (`top`, `bottom`, `left`, `right`).
- **DefaultSubmit plugin** — Automatically calls `form.submit()` when all fields pass validation. Throws a clear error on install if any control named `name="submit"` would shadow the native method.
- **FieldStatus plugin** — Tracks per-field validation status (`NotValidated`, `Validating`, `Valid`, `Invalid`) and fires an `onStatusChanged(boolean)` callback on every change. Exposes `getStatuses()` and `areFieldsValid()` methods.
- **Declarative plugin** — Configures field validators entirely through HTML `data-fv-*` attributes — no `fields` option in JavaScript needed. Supports a `___` separator for validator options, a configurable `prefix`, an `html5Input` mode that maps native HTML5 attributes (`required`, `type`, `minlength`, `pattern`, `min`, `max`, …) to validators, and dynamic field detection via `core.field.added`.

### Fixed

- **Aria:** unique container IDs are now generated per instance to avoid collisions when multiple Validare instances share a page.
- **Aria:** the `aria-describedby` container is cleaned up and `aria-invalid` is reset when a field transitions to Valid.
- **AutoFocus:** statuses are cleared on `core.form.validating` so re-validations start with a clean slate; fixed status not resetting correctly on `fv.reset()`.
- **DefaultSubmit:** the `name="submit"` safety guard now covers all form controls (not just `type="submit"` buttons).
- **Tooltip:** fixed a null-reference crash in `uninstall()` when the tooltip element had not been created yet.
- **Declarative:** added a null guard on `options.validators` in `onFieldAdded` to prevent crashes from malformed dynamic field configs.

---

## [2.1.0] — 2026-05-27

### Added

- **Dependency plugin** — Prevents validation of a field until one or more other named fields have been validated first. Useful for "confirm password" patterns.
- **StartEndDate plugin** — Cross-validates a pair of date fields so the start date is always before (or equal to) the end date. Configurable `format`, `min`, and `max` bounds.
- **Transformer plugin** — Intercepts the value read by each validator through the `field-value` filter, allowing normalisation (trimming, stripping formatting characters, etc.) without mutating the DOM.
- **`Message` plugin:** `first` option — when set to `true`, only the first failing validator's message is shown per field (requires the `Sequence` plugin to be present).
- **`field-value` filter** — New Core filter hook used by the Transformer plugin.
- **`removeValidator` / `deregisterValidator`** Core methods — Remove a specific validator from a single field or unregister a validator factory globally.

### Fixed

- **Sequence plugin:** multiple error messages were appearing on the first validation run because the `element-validated` filter was not applied early enough. Fixed by moving the filter application to the correct phase.
- **Trigger plugin:** field validation cache was not cleared before re-validating on DOM events, causing stale results.
- **StartEndDate:** unique instance keys prevent cross-instance interference; `parseDate` now rejects overflowed calendar dates (e.g. February 30).
- **Dependency:** widened payload cast and tightened loop guard.

---

## [2.0.0] — 2026-05-20

### Added

- **28 additional validators** across six new categories, bringing the total to 50:
  - *Format & Encoding (6):* `base64`, `hex`, `mac`, `bic`, `uuid`, `color`
  - *Financial (6):* `iban`, `vat`, `cusip`, `isin`, `sedol`, `grid`
  - *Publication (4):* `ean`, `isbn`, `ismn`, `issn`
  - *Device & Vehicle (5):* `imei`, `imo`, `meid`, `step`, `vin`
  - *Tax & Business (4):* `ein`, `rtn`, `siren`, `siret`
  - *Identity & Geographic (3):* `id`, `phone`, `zipCode`

### Changed

- Validator registry is now populated at startup from a single index (`src/validators/index.ts`) — no Core changes required when adding new validators.

---

## [1.0.0] — 2026-05-14

### Added

- Core validation engine (`Core`, `Plugin`, `Emitter`, `Filter`)
- **22 core validators:** `notEmpty`, `email`, `creditCard`, `date`, `digits`, `integer`, `numeric`, `regexp`, `uri`, `identical`, `different`, `between`, `greaterThan`, `lessThan`, `stringLength`, `stringCase`, `choice`, `file`, `callback`, `promise`, `remote`, `ip`
- **9 core plugins:** `Trigger`, `Message`, `Icon`, `SubmitButton`, `Excluded`, `Sequence`, `Aria` (v1), `Bootstrap5`, `Bulma`, `Tailwind`
- **Locales:** `en_US` (default), `pt_BR`
- TypeScript-first API with full type exports
- ESM, CJS, and UMD bundles via tsup

[2.2.0]: https://github.com/varantes/validare/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/varantes/validare/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/varantes/validare/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/varantes/validare/releases/tag/v1.0.0
