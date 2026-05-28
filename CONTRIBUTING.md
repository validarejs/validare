# Contributing to Validare

## Setup

```bash
git clone https://github.com/varantes/validare.git
cd validare
npm install
```

## Commands

```bash
npm test              # Run all tests (Vitest + jsdom)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run build         # Build ESM + CJS + UMD (tsup)
npm run typecheck     # TypeScript type check
npm run lint          # Biome lint
npm run format        # Biome format (writes in place)
```

## Code Style

[Biome](https://biomejs.dev/) handles formatting and linting — 2-space indent, 100-char line width. Run `npm run format` before committing. CI will fail on lint errors.

Biome config: `biome.json`.

## Project Structure

```
src/
  core/           # Engine: Core, Plugin, Emitter, Filter, types
  validators/     # One file per validator (camelCase, e.g. notEmpty.ts)
  plugins/
    core/         # Core plugins (PascalCase, e.g. Message.ts)
    frameworks/   # CSS framework integrations
  locales/        # Locale packages (en_US.ts, pt_BR.ts, …)
  index.ts        # Public entry — registers built-in validators & re-exports

tests/
  validators/     # Mirror of src/validators/
  plugins/        # Mirror of src/plugins/core/ and plugins/frameworks/
  locales/        # Locale tests
```

## Adding a Validator

1. **Create** `src/validators/<name>.ts` — implement `ValidatorFactory`:

```ts
import type { ValidatorFactory } from "../core/types";

export interface MyValidatorOptions {
  message?: string;
  [key: string]: unknown;
}

export const myValidator: ValidatorFactory = (opts: MyValidatorOptions = {}) => ({
  validate(input) {
    const valid = /* your check */ true;
    return { valid, message: valid ? "" : (opts.message ?? "Invalid value") };
  },
});
```

2. **Register** in `src/validators/index.ts` — add to the export map:

```ts
export { myValidator } from "./myValidator";
```

The factory is auto-registered by `src/index.ts` under the key `"myValidator"` — no further changes needed.

3. **Test** in `tests/validators/myValidator.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { myValidator } from "../../src/validators/myValidator";

describe("myValidator", () => {
  it("returns valid for …", () => {
    const v = myValidator();
    expect(v.validate({ value: "good" }).valid).toBe(true);
  });

  it("returns invalid for …", () => {
    const v = myValidator();
    expect(v.validate({ value: "bad" }).valid).toBe(false);
  });
});
```

Run `npm test -- tests/validators/myValidator.test.ts` to verify.

## Adding a Plugin

1. **Create** `src/plugins/core/<Name>.ts` — extend `Plugin<OptionsType>`:

```ts
import { Plugin } from "../../core/Plugin";

export interface MyPluginOptions {
  enabled?: boolean;
  [key: string]: unknown;
}

export class MyPlugin extends Plugin<MyPluginOptions> {
  constructor(opts?: MyPluginOptions) {
    super(opts);
    if (opts?.enabled === false) this.disable();
  }

  private onSomeEvent = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    // ...
  };

  install(): void {
    this.core.on("core.form.valid", this.onSomeEvent);
  }

  uninstall(): void {
    this.core.off("core.form.valid", this.onSomeEvent);
    // clean up any DOM mutations or timers here
  }
}
```

Key rules:
- Use arrow function properties for event handlers — they bind `this` automatically.
- Call `super(opts)` (not `super({ ...opts })`). Use `super({ defaults, ...opts })` only when you need to merge option defaults.
- Always remove event listeners and clean up DOM in `uninstall()`.
- When calling `addField()` inside an `onFieldAdded` handler, guard with a `Set<string>` to avoid infinite loops (the event re-fires after `addField`).
- For plugins that need to track fields registered before `install()` runs, seed state in `install()` via `this.core.getFields()`.

2. **Export** from `src/plugins/index.ts`:

```ts
export { MyPlugin } from "./core/MyPlugin";
export type { MyPluginOptions } from "./core/MyPlugin";
```

3. **Test** in `tests/plugins/MyPlugin.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { validare } from "../../src/index";
import { MyPlugin } from "../../src/plugins/core/MyPlugin";

let dom: JSDOM;
let form: HTMLFormElement;

beforeEach(() => {
  dom = new JSDOM(`<form id="f"><input name="email"></form>`, {
    url: "http://localhost",
  });
  global.document = dom.window.document as unknown as Document;
  global.HTMLElement = dom.window.HTMLElement;
  form = dom.window.document.getElementById("f") as HTMLFormElement;
});

describe("MyPlugin", () => {
  it("does the thing", async () => {
    const fv = validare(form, {
      plugins: { myPlugin: new MyPlugin() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    // assert expected behaviour
  });
});
```

## Adding a Locale

1. **Create** `src/locales/<locale>.ts` with translated messages for all 22 core validators (follow `src/locales/en_US.ts` as a template).
2. **Export** from `src/locales/index.ts`.
3. **Test** in `tests/locales/locales.test.ts` — add a `describe` block for the new locale.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(validator): add myValidator
feat(plugin): add MyPlugin
fix(sequence): clear cache before re-validate
docs: update CHANGELOG.md
chore: bump version to 2.3.0
```

Scope is the validator or plugin name (lowercase). Use `feat` for new additions, `fix` for bug fixes, `docs` for documentation-only changes, `chore` for maintenance.

## Pull Requests

- One logical change per PR.
- All tests must pass (`npm test`) and there must be no lint errors (`npm run lint`).
- Add or update tests for any changed behaviour.
- Update `CHANGELOG.md` under an `## [Unreleased]` heading.

## Versioning

Validare follows [Semantic Versioning](https://semver.org/):

| Change | Version bump |
|---|---|
| New validator or plugin, new option | `MINOR` |
| Bug fix, internal refactor | `PATCH` |
| Breaking API change | `MAJOR` |

## License

By contributing you agree that your changes will be licensed under the project's [MIT License](LICENSE).
