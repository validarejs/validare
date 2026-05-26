# Validare Docs — Design Spec

**Date:** 2026-05-25
**Project:** `validare-docs` (separate repository)
**Goal:** Full documentation website to showcase and market the Validare library.

---

## Overview

A VitePress documentation site with a landing page, full validator/plugin reference, and an integrated interactive playground. Hosted on GitHub Pages. Built in a separate repository (`validare-docs`).

---

## Tech Stack

| Decision | Choice | Reason |
|---|---|---|
| Site generator | VitePress (default theme) | Battle-tested for JS library docs, built-in nav/sidebar/search/dark mode |
| Playground editor | CodeMirror (via `@codemirror/...` packages) | Lightweight, well-maintained, easy to embed in Vue |
| Playground runtime | `<iframe srcdoc sandbox>` | Zero external dependencies, instant load, sandboxed |
| Validare bundle | `/public/validare.umd.js` (local copy) | No CDN dependency in playground, works offline |
| Deployment | GitHub Actions → GitHub Pages | Free, automatic on push to `main` |
| Hosting | GitHub Pages | Free, `username.github.io/validare-docs` or custom domain |

---

## Repository Structure

```
validare-docs/
  .vitepress/
    config.ts                        # Nav, sidebar, search, theme config
    theme/
      index.ts                       # Theme entry — extends default theme
      components/
        ValidarePlayground.vue       # CodeMirror editor + iframe preview
      style.css                      # Global style overrides (minimal)
  public/
    validare.umd.js                  # Copied from validare dist
  index.md                           # Landing page (layout: home)
  guide/
    getting-started.md
    plugins.md
    localization.md
    custom-validators.md
  validators/
    index.md                         # All 50 validators listed by category
    notEmpty.md
    email.md
    creditCard.md
    date.md
    digits.md
    integer.md
    numeric.md
    regexp.md
    uri.md
    identical.md
    different.md
    between.md
    greaterThan.md
    lessThan.md
    stringLength.md
    stringCase.md
    choice.md
    file.md
    callback.md
    promise.md
    remote.md
    ip.md
    base64.md
    hex.md
    mac.md
    bic.md
    uuid.md
    color.md
    iban.md
    vat.md
    cusip.md
    isin.md
    sedol.md
    grid.md
    ean.md
    isbn.md
    ismn.md
    issn.md
    imei.md
    imo.md
    meid.md
    step.md
    vin.md
    ein.md
    rtn.md
    siren.md
    siret.md
    id.md
    phone.md
    zipCode.md
  plugins/
    index.md                         # All 9 plugins listed
    Trigger.md
    Message.md
    Icon.md
    SubmitButton.md
    Excluded.md
    Sequence.md
    Bootstrap5.md
    Bulma.md
    Tailwind.md
  api/
    index.md                         # Full Core API reference
  .github/
    workflows/
      deploy.yml                     # Build + deploy to GitHub Pages
  package.json
  tsconfig.json
```

---

## Pages

### Landing Page (`index.md`)

Uses VitePress `layout: home` frontmatter with custom sections:

**Hero section:**
- Name: `Validare`
- Tagline: *Modern form validation. Plugin-based, zero dependencies, TypeScript-first.*
- Actions: `Get Started` (→ `/guide/getting-started`) and `View on GitHub`
- Badge line: `50 validators · 9 plugins · 686 tests passing`

**Features grid (6 cards):**
1. Zero dependencies — no jQuery, no frameworks
2. TypeScript-first — full type safety and autocompletion
3. Plugin-based — small core, extend what you need
4. 50 built-in validators — covers the vast majority of real-world cases
5. CSS framework integrations — Bootstrap 5, Bulma, Tailwind
6. Sync + async — callback, promise, and remote validators

**Interactive playground demo:**
- A `<ValidarePlayground>` component embedded directly on the landing page
- Pre-loaded with a simple email + notEmpty form so visitors can try the library immediately
- No signup, no install required

**Quick install block:**
```bash
npm install validare
```

**Footer:** GitHub link, npm link, MIT license.

---

### Guide Section

| Page | Content |
|---|---|
| `getting-started.md` | Installation (npm + CDN), first form, submit handling |
| `plugins.md` | How plugins work, which plugins to combine, common setups |
| `localization.md` | `locale` option, available locales (`en_US`, `pt_BR`), adding custom locales |
| `custom-validators.md` | `callback`, `promise`, `remote` — patterns for custom validation logic |

---

### Validator Pages (50 pages)

Each page follows this structure:

```markdown
# `{name}`

One-line description.

## Options

| Option | Type | Default | Description |
|---|---|---|---|

## Playground

<ValidarePlayground :code="defaultCode" />

## Valid values

| Value | Notes |
|---|---|

## Invalid values

| Value | Reason |
|---|---|

## Notes

Special cases, country options, empty string behavior, etc.
```

**Content source:** Adapted from `validare/docs/validators/*.md` (already written). The main addition is the `<ValidarePlayground>` component with a pre-written `defaultCode` snippet for each validator.

---

### Plugin Pages (9 pages)

Same structure as validator pages. The playground shows a complete form with the plugin configured. CSS framework plugin pages (Bootstrap5, Bulma, Tailwind) load the framework CSS inside the iframe.

---

### API Reference (`api/index.md`)

Full reference for the `Core` instance returned by `validare()`:

```ts
validare(form, options): Core

// Core methods
fv.validate(): Promise<'Valid' | 'Invalid' | 'NotValidated'>
fv.validateField(field): Promise<...>
fv.addField(field, options): Core
fv.removeField(field): Core
fv.enableValidator(field, validator): Core
fv.disableValidator(field, validator): Core
fv.resetField(field): Core
fv.reset(): Core
fv.destroy(): void
fv.on(event, handler): Core
fv.off(event, handler): Core
```

Includes events reference table and `ElementValidatedPayload` shape.

---

## Playground Component (`ValidarePlayground.vue`)

### Props

```ts
defineProps<{
  code: string       // Initial JS code shown in the editor
  height?: string    // iframe height (default: '250px')
}>()
```

### Behavior

1. **Editor:** CodeMirror instance with JavaScript syntax highlighting. User can freely edit the code.
2. **Preview:** An `<iframe srcdoc sandbox="allow-scripts">` renders a full HTML document containing:
   - A minimal form (`<form id="demo" novalidate>`) with fields matching the example
   - A `<script src="/validare.umd.js">` tag (served from `/public/`)
   - The user's code injected as an inline `<script>`
3. **Live update:** On every editor change (debounced 300ms), the iframe's `srcdoc` is updated with the new code.
4. **Reset button:** Restores the editor to the initial `code` prop value.
5. **Error display:** JavaScript errors from the iframe are caught via `window.onerror` and shown below the preview as a red message.

### iframe HTML template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>/* minimal form styles */</style>
</head>
<body>
  <!-- form markup injected per-page (part of the code prop) -->
  <script src="/validare.umd.js"></script>
  <script>
    window.onerror = (msg) => { /* post error to parent */ };
    /* user code here */
  </script>
</body>
</html>
```

The `code` prop includes both the HTML markup (as a template string or separate) and the JS configuration. Each validator/plugin page provides a `defaultCode` that matches its existing HTML example from the `validare` repo.

---

## GitHub Actions Deploy

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: .vitepress/dist }
      - uses: actions/deploy-pages@v4
```

---

## Updating the Validare Bundle

When a new version of `validare` is published:

1. Build the lib: `cd validare && npm run build`
2. Copy the UMD bundle: `cp validare/dist/index.umd.js validare-docs/public/validare.umd.js`
3. Commit and push to `validare-docs` — GitHub Actions deploys automatically

A helper script (`scripts/update-bundle.sh`) will automate steps 1–2.

---

## Out of Scope

- Search (VitePress local search is built-in, no config needed)
- Analytics (can be added later via VitePress `head` config)
- Versioned docs (single version for now)
- i18n (site is English-only)
