# Validare Docs Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `validare-docs` VitePress site — a full documentation + marketing website for the Validare form validation library, with an interactive playground on every page, deployed to GitHub Pages.

**Architecture:** VitePress default theme in a separate repo at `/Users/varantes/workspace/sandbox/jvalidation/validare-docs/`. A `ValidarePlayground.vue` component renders a CodeMirror editor + sandboxed iframe for live demos. The Validare UMD bundle is served from `/public/validare.umd.js` and fetched + inlined into each iframe at runtime. All 50 validator pages and 9 plugin pages are adapted from existing Markdown docs in the `validare` repo.

**Tech Stack:** VitePress 1.x, Vue 3, CodeMirror 6 (`codemirror`, `@codemirror/lang-javascript`, `@codemirror/theme-one-dark`), GitHub Actions for Pages deploy.

**Source reference:** Existing validator/plugin docs live in `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/validators/` and `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/plugins/` — read them when building each page.

---

## File Map

```
validare-docs/                                  ← new repo root
  .vitepress/
    config.ts                                   # VitePress config: nav, sidebar, base
    theme/
      index.ts                                  # Extends default theme, registers ValidarePlayground
      style.css                                 # Minimal global overrides
      components/
        ValidarePlayground.vue                  # CodeMirror editor + iframe sandbox
  public/
    validare.umd.js                             # Copied from validare/dist/index.umd.js
  scripts/
    update-bundle.sh                            # Helper: rebuild validare + copy UMD
  .github/workflows/
    deploy.yml                                  # Build + deploy to GitHub Pages
  .gitignore
  package.json
  tsconfig.json
  index.md                                      # Landing page (layout: home + playground)
  guide/
    getting-started.md
    plugins.md
    localization.md
    custom-validators.md
  validators/
    index.md                                    # All 50 validators by category
    notEmpty.md  email.md  creditCard.md  date.md
    digits.md  integer.md  numeric.md  regexp.md  uri.md
    identical.md  different.md  between.md  greaterThan.md  lessThan.md
    stringLength.md  stringCase.md  choice.md  file.md
    callback.md  promise.md  remote.md  ip.md
    base64.md  hex.md  mac.md  bic.md  uuid.md  color.md
    iban.md  vat.md  cusip.md  isin.md  sedol.md  grid.md
    ean.md  isbn.md  ismn.md  issn.md
    imei.md  imo.md  meid.md  step.md  vin.md
    ein.md  rtn.md  siren.md  siret.md
    id.md  phone.md  zipCode.md
  plugins/
    index.md                                    # All 9 plugins
    Trigger.md  Message.md  Icon.md  SubmitButton.md  Excluded.md  Sequence.md
    Bootstrap5.md  Bulma.md  Tailwind.md
  api/
    index.md                                    # Core API reference
```

---

## Task 1: Repo Scaffold + VitePress Config + GitHub Actions

**Files:**
- Create: `validare-docs/package.json`
- Create: `validare-docs/tsconfig.json`
- Create: `validare-docs/.gitignore`
- Create: `validare-docs/.vitepress/config.ts`
- Create: `validare-docs/.vitepress/theme/index.ts`
- Create: `validare-docs/.vitepress/theme/style.css`
- Create: `validare-docs/.github/workflows/deploy.yml`
- Create: `validare-docs/scripts/update-bundle.sh`
- Copy: `validare/dist/index.umd.js` → `validare-docs/public/validare.umd.js`

- [ ] **Step 1: Create the repo directory and initialise git**

```bash
mkdir -p /Users/varantes/workspace/sandbox/jvalidation/validare-docs
cd /Users/varantes/workspace/sandbox/jvalidation/validare-docs
git init
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "validare-docs",
  "private": true,
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "devDependencies": {
    "vitepress": "^1.6.3",
    "vue": "^3.5.13",
    "codemirror": "^6.0.1",
    "@codemirror/lang-javascript": "^6.2.3",
    "@codemirror/theme-one-dark": "^6.1.2"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "lib": ["ES2022", "DOM"]
  },
  "include": [".vitepress/**/*.ts", ".vitepress/**/*.vue"]
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
.vitepress/dist/
.vitepress/cache/
```

- [ ] **Step 5: Create `.vitepress/config.ts`**

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Validare',
  description: 'Modern form validation. Plugin-based, zero dependencies, TypeScript-first.',
  base: '/validare-docs/',   // change to '/' if using a custom domain

  themeConfig: {
    logo: { light: '/logo.svg', dark: '/logo.svg', alt: 'Validare' },

    nav: [
      { text: 'Guide',       link: '/guide/getting-started' },
      { text: 'Validators',  link: '/validators/' },
      { text: 'Plugins',     link: '/plugins/' },
      { text: 'API',         link: '/api/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started',    link: '/guide/getting-started' },
            { text: 'Using Plugins',      link: '/guide/plugins' },
            { text: 'Localization',       link: '/guide/localization' },
            { text: 'Custom Validators',  link: '/guide/custom-validators' },
          ],
        },
      ],

      '/validators/': [
        { text: 'All Validators', link: '/validators/' },
        {
          text: 'Core (22)',
          collapsed: false,
          items: [
            { text: 'notEmpty',      link: '/validators/notEmpty' },
            { text: 'email',         link: '/validators/email' },
            { text: 'creditCard',    link: '/validators/creditCard' },
            { text: 'date',          link: '/validators/date' },
            { text: 'digits',        link: '/validators/digits' },
            { text: 'integer',       link: '/validators/integer' },
            { text: 'numeric',       link: '/validators/numeric' },
            { text: 'regexp',        link: '/validators/regexp' },
            { text: 'uri',           link: '/validators/uri' },
            { text: 'identical',     link: '/validators/identical' },
            { text: 'different',     link: '/validators/different' },
            { text: 'between',       link: '/validators/between' },
            { text: 'greaterThan',   link: '/validators/greaterThan' },
            { text: 'lessThan',      link: '/validators/lessThan' },
            { text: 'stringLength',  link: '/validators/stringLength' },
            { text: 'stringCase',    link: '/validators/stringCase' },
            { text: 'choice',        link: '/validators/choice' },
            { text: 'file',          link: '/validators/file' },
            { text: 'callback',      link: '/validators/callback' },
            { text: 'promise',       link: '/validators/promise' },
            { text: 'remote',        link: '/validators/remote' },
            { text: 'ip',            link: '/validators/ip' },
          ],
        },
        {
          text: 'Format & Encoding (6)',
          collapsed: true,
          items: [
            { text: 'base64', link: '/validators/base64' },
            { text: 'hex',    link: '/validators/hex' },
            { text: 'mac',    link: '/validators/mac' },
            { text: 'bic',    link: '/validators/bic' },
            { text: 'uuid',   link: '/validators/uuid' },
            { text: 'color',  link: '/validators/color' },
          ],
        },
        {
          text: 'Financial (6)',
          collapsed: true,
          items: [
            { text: 'iban',  link: '/validators/iban' },
            { text: 'vat',   link: '/validators/vat' },
            { text: 'cusip', link: '/validators/cusip' },
            { text: 'isin',  link: '/validators/isin' },
            { text: 'sedol', link: '/validators/sedol' },
            { text: 'grid',  link: '/validators/grid' },
          ],
        },
        {
          text: 'Publication (4)',
          collapsed: true,
          items: [
            { text: 'ean',  link: '/validators/ean' },
            { text: 'isbn', link: '/validators/isbn' },
            { text: 'ismn', link: '/validators/ismn' },
            { text: 'issn', link: '/validators/issn' },
          ],
        },
        {
          text: 'Device & Vehicle (5)',
          collapsed: true,
          items: [
            { text: 'imei', link: '/validators/imei' },
            { text: 'imo',  link: '/validators/imo' },
            { text: 'meid', link: '/validators/meid' },
            { text: 'step', link: '/validators/step' },
            { text: 'vin',  link: '/validators/vin' },
          ],
        },
        {
          text: 'Tax & Business (4)',
          collapsed: true,
          items: [
            { text: 'ein',   link: '/validators/ein' },
            { text: 'rtn',   link: '/validators/rtn' },
            { text: 'siren', link: '/validators/siren' },
            { text: 'siret', link: '/validators/siret' },
          ],
        },
        {
          text: 'Identity & Geographic (3)',
          collapsed: true,
          items: [
            { text: 'id',      link: '/validators/id' },
            { text: 'phone',   link: '/validators/phone' },
            { text: 'zipCode', link: '/validators/zipCode' },
          ],
        },
      ],

      '/plugins/': [
        { text: 'All Plugins', link: '/plugins/' },
        {
          text: 'Core Plugins (6)',
          items: [
            { text: 'Trigger',      link: '/plugins/Trigger' },
            { text: 'Message',      link: '/plugins/Message' },
            { text: 'Icon',         link: '/plugins/Icon' },
            { text: 'SubmitButton', link: '/plugins/SubmitButton' },
            { text: 'Excluded',     link: '/plugins/Excluded' },
            { text: 'Sequence',     link: '/plugins/Sequence' },
          ],
        },
        {
          text: 'CSS Frameworks (3)',
          items: [
            { text: 'Bootstrap5', link: '/plugins/Bootstrap5' },
            { text: 'Bulma',      link: '/plugins/Bulma' },
            { text: 'Tailwind',   link: '/plugins/Tailwind' },
          ],
        },
      ],

      '/api/': [
        { text: 'API Reference', items: [{ text: 'Core', link: '/api/' }] },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/varantes/validare' },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Inspired by FormValidation (discontinued)',
    },
  },
})
```

- [ ] **Step 6: Create `.vitepress/theme/index.ts`**

```ts
import DefaultTheme from 'vitepress/theme'
import ValidarePlayground from './components/ValidarePlayground.vue'
import './style.css'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ValidarePlayground', ValidarePlayground)
  },
} satisfies Theme
```

- [ ] **Step 7: Create `.vitepress/theme/style.css`**

```css
/* Minimal overrides — VitePress default theme handles everything else */
:root {
  --vp-font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Playground container spacing */
.vp-playground {
  margin: 1.5rem 0;
}
```

- [ ] **Step 8: Create `ValidarePlayground.vue` placeholder** (will be replaced in Task 2)

```
mkdir -p .vitepress/theme/components
```

Create `.vitepress/theme/components/ValidarePlayground.vue` with minimal placeholder:

```vue
<template>
  <div style="border:1px solid #ccc;padding:1rem;border-radius:4px;color:#666">
    Playground loading…
  </div>
</template>
<script setup lang="ts">
defineProps<{ code: string; height?: string }>()
</script>
```

- [ ] **Step 9: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 10: Create `scripts/update-bundle.sh`**

```bash
#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VALIDARE_DIR="$(cd "$REPO_ROOT/../validare" && pwd)"

echo "Building validare..."
(cd "$VALIDARE_DIR" && npm run build)

echo "Copying UMD bundle..."
cp "$VALIDARE_DIR/dist/index.umd.js" "$REPO_ROOT/public/validare.umd.js"

echo "Done. validare.umd.js updated."
```

Make it executable: `chmod +x scripts/update-bundle.sh`

- [ ] **Step 11: Copy UMD bundle**

```bash
mkdir -p public
cp /Users/varantes/workspace/sandbox/jvalidation/validare/dist/index.umd.js public/validare.umd.js
```

- [ ] **Step 12: Install dependencies and verify build**

```bash
npm install
npm run build
```

Expected: build completes with no errors, `.vitepress/dist/` created.

- [ ] **Step 13: Create a minimal `index.md` to verify site loads**

```markdown
---
layout: home
hero:
  name: Validare
  text: Modern form validation
  tagline: Plugin-based, zero dependencies, TypeScript-first.
---
```

Run `npm run dev` and verify the site loads at `http://localhost:5173/validare-docs/`.

- [ ] **Step 14: Commit**

```bash
git add .
git commit -m "feat: scaffold validare-docs VitePress site"
```

---

## Task 2: ValidarePlayground Component

**Files:**
- Modify: `.vitepress/theme/components/ValidarePlayground.vue` (replace placeholder)

The component fetches the Validare UMD bundle once on mount, inlines it into an `<iframe srcdoc>` sandbox, and uses CodeMirror 6 as the editor. User edits trigger a 300ms debounced iframe refresh.

- [ ] **Step 1: Replace `ValidarePlayground.vue` with full implementation**

```vue
<template>
  <div class="vp-playground">
    <div class="vp-playground__editor" ref="editorEl" />
    <div class="vp-playground__toolbar">
      <button class="vp-playground__reset" @click="reset">Reset</button>
    </div>
    <div v-if="error" class="vp-playground__error">{{ error }}</div>
    <iframe
      class="vp-playground__preview"
      sandbox="allow-scripts"
      :srcdoc="srcdoc"
      :style="{ height: props.height ?? '280px' }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

const props = withDefaults(
  defineProps<{ code: string; height?: string }>(),
  { height: '280px' }
)

const editorEl = ref<HTMLElement | null>(null)
const srcdoc    = ref('')
const error     = ref('')

let view: EditorView | null = null
let validareSource = ''
let timer: ReturnType<typeof setTimeout> | null = null

// ─── iframe HTML template ───────────────────────────────────────────────────
function buildSrcdoc(userCode: string): string {
  // Escape </script> inside validareSource to avoid premature end-of-script
  const safeSource = validareSource.replace(/<\/script>/gi, '<\\/script>')
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*,*::before,*::after{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:1rem;margin:0;font-size:14px}
.field{margin-bottom:1rem}
fieldset.field{border:1px solid #ccc;padding:.5rem .75rem;border-radius:4px}
legend{font-weight:500;padding:0 .25rem}
label{display:block;margin-bottom:.25rem;font-weight:500}
input[type=text],input[type=email],input[type=password],input[type=number],
input[type=url],input[type=tel],input[type=file],select{
  display:block;width:100%;padding:.375rem .75rem;border:1px solid #ccc;
  border-radius:4px;font-size:14px}
input.fv-valid{border-color:#198754}
input.fv-invalid{border-color:#dc3545}
.fv-plugins-message-container{color:#dc3545;font-size:.8125rem;margin-top:.25rem;min-height:1.2em}
button[type=submit]{padding:.375rem .75rem;background:#0d6efd;color:#fff;
  border:none;border-radius:4px;cursor:pointer;font-size:14px}
button[type=submit]:disabled{opacity:.6;cursor:not-allowed}
</style>
</head>
<body>
<script>(function(){${safeSource}})()</scr` + `ipt>
<script>
window.onerror=function(m,s,l,c,e){
  parent.postMessage({type:'pg-error',msg:String(e||m)},'*');
  return true;
};
try{${userCode}}catch(e){parent.postMessage({type:'pg-error',msg:String(e)},'*');}
</scr` + `ipt>
</body>
</html>`
}
// Note: the split string literals above prevent the HTML parser from
// seeing </script> inside this JS source and terminating the tag early.

function render(code: string) {
  srcdoc.value = buildSrcdoc(code)
  error.value  = ''
}

function reset() {
  view?.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: props.code } })
  render(props.code)
}

function onMessage(e: MessageEvent) {
  if (e.data?.type === 'pg-error') error.value = e.data.msg
}

onMounted(async () => {
  // 1. Fetch validare UMD bundle
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'validare.umd.js')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    validareSource = await res.text()
  } catch (e) {
    error.value = 'Could not load validare.umd.js: ' + String(e)
    return
  }

  // 2. Create CodeMirror editor
  view = new EditorView({
    doc: props.code,
    extensions: [
      basicSetup,
      javascript(),
      oneDark,
      EditorView.updateListener.of(u => {
        if (!u.docChanged) return
        const code = u.state.doc.toString()
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => render(code), 300)
      }),
    ],
    parent: editorEl.value!,
  })

  // 3. Initial render
  render(props.code)

  window.addEventListener('message', onMessage)
})

onUnmounted(() => {
  view?.destroy()
  if (timer) clearTimeout(timer)
  window.removeEventListener('message', onMessage)
})
</script>

<style scoped>
.vp-playground {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 1.5rem 0;
}
.vp-playground__editor { border-bottom: 1px solid var(--vp-c-divider); }
.vp-playground__editor :deep(.cm-editor) { max-height: 320px; }
.vp-playground__editor :deep(.cm-scroller) { overflow: auto; }
.vp-playground__toolbar {
  display: flex;
  justify-content: flex-end;
  padding: .25rem .5rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.vp-playground__reset {
  font-size: 12px;
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  cursor: pointer;
  color: var(--vp-c-text-2);
}
.vp-playground__reset:hover { color: var(--vp-c-text-1); }
.vp-playground__error {
  padding: .4rem .75rem;
  background: #fee2e2;
  color: #dc2626;
  font-size: .8125rem;
  font-family: var(--vp-font-family-mono);
}
.vp-playground__preview {
  width: 100%;
  border: none;
  display: block;
  background: #fff;
}
</style>
```

- [ ] **Step 2: Build and verify no TypeScript errors**

```bash
npm run build
```

Expected: builds without errors.

- [ ] **Step 3: Smoke-test in dev mode**

```bash
npm run dev
```

Open `http://localhost:5173/validare-docs/`. Verify no console errors.

- [ ] **Step 4: Commit**

```bash
git add .vitepress/theme/components/ValidarePlayground.vue
git commit -m "feat: add ValidarePlayground component (CodeMirror + iframe sandbox)"
```

---

## Task 3: Landing Page

**Files:**
- Modify: `index.md` (replace minimal placeholder from Task 1)

- [ ] **Step 1: Write `index.md`**

```markdown
---
layout: home

hero:
  name: Validare
  text: Modern form validation
  tagline: Plugin-based, zero dependencies, TypeScript-first.
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/varantes/validare

features:
  - icon: 🚫
    title: Zero dependencies
    details: No jQuery, no frameworks required. Works in any JS environment.
  - icon: 🔷
    title: TypeScript-first
    details: Full type safety and IDE autocompletion out of the box.
  - icon: 🔌
    title: Plugin-based architecture
    details: Tiny core engine. Add only the plugins your project needs.
  - icon: ✅
    title: 50 built-in validators
    details: Core, financial, identity, encoding, device, and more — ready to use.
  - icon: 🎨
    title: CSS framework integrations
    details: Bootstrap 5, Bulma, and Tailwind CSS plugins included.
  - icon: ⚡
    title: Sync + async validation
    details: Callback, Promise, and remote validators with debounce support.
---

## Try it live

Edit the code below and validate the form instantly.

<script setup>
const demoCode = `document.body.innerHTML = \`
  <form id="demo" novalidate>
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Password (min 8 characters)</label>
      <input type="password" name="password" placeholder="••••••••">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
\`;

const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    email:    { validators: { notEmpty: {}, email: {} } },
    password: { validators: { notEmpty: {}, stringLength: { min: 8 } } }
  },
  plugins: {
    trigger: new Trigger({ event: 'blur' }),
    message: new Message()
  }
});`
</script>

<ValidarePlayground :code="demoCode" height="300px" />

## Install

::: code-group

```bash [npm]
npm install validare
```

```bash [pnpm]
pnpm add validare
```

```bash [yarn]
yarn add validare
```

:::

50 validators · 9 plugins · 686 tests passing · MIT license
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add index.md
git commit -m "feat: add landing page with hero, features, and live playground"
```

---

## Task 4: Guide Pages

**Files:**
- Create: `guide/getting-started.md`
- Create: `guide/plugins.md`
- Create: `guide/localization.md`
- Create: `guide/custom-validators.md`

- [ ] **Step 1: Create `guide/getting-started.md`**

```markdown
# Getting Started

## Installation

::: code-group

```bash [npm]
npm install validare
```

```bash [CDN (UMD)]
<script src="https://unpkg.com/validare/dist/index.umd.js"></script>
```

:::

## Your First Form

```html
<form id="myForm" novalidate>
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" />
    <div class="fv-plugins-message-container"></div>
  </div>
  <button type="submit">Submit</button>
</form>
```

```js
import { validare, Trigger, Message } from 'validare';

const fv = validare(document.getElementById('myForm'), {
  fields: {
    email: {
      validators: {
        notEmpty: { message: 'Email is required' },
        email:    { message: 'Please enter a valid email' },
      },
    },
  },
  plugins: {
    trigger:  new Trigger({ event: 'blur' }),
    message:  new Message(),
  },
});
```

## Handling Submit

```js
document.getElementById('myForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const result = await fv.validate();
  if (result === 'Valid') {
    // safe to submit
  }
});
```

`fv.validate()` returns `'Valid'`, `'Invalid'`, or `'NotValidated'`.

## CDN Usage

```html
<script src="https://unpkg.com/validare/dist/index.umd.js"></script>
<script>
  const { validare, Trigger, Message } = Validare;

  const fv = validare(document.getElementById('myForm'), {
    fields: {
      email: { validators: { notEmpty: {}, email: {} } },
    },
    plugins: {
      trigger: new Trigger({ event: 'blur' }),
      message: new Message(),
    },
  });
</script>
```
```

- [ ] **Step 2: Create `guide/plugins.md`**

```markdown
# Using Plugins

Plugins extend the core engine. Pass them in the `plugins` option as a key → instance map.

```js
const fv = validare(form, {
  fields: { /* ... */ },
  plugins: {
    trigger:      new Trigger({ event: 'blur' }),
    message:      new Message(),
    submitButton: new SubmitButton(),
    sequence:     new Sequence(),
  },
});
```

The key name is arbitrary — it's just how you reference the plugin later (e.g. `fv.getPlugin('trigger')`).

## Recommended Combinations

### Minimal (manual submit only)

```js
plugins: {}  // validate only via fv.validate()
```

### Standard

```js
plugins: {
  trigger: new Trigger({ event: 'blur' }),
  message: new Message(),
}
```

### Full UX

```js
plugins: {
  trigger:      new Trigger({ event: 'blur' }),
  message:      new Message(),
  icon:         new Icon({ valid: '✓', invalid: '✗' }),
  submitButton: new SubmitButton(),
  sequence:     new Sequence(),
}
```

### With Bootstrap 5

```js
plugins: {
  trigger: new Trigger({ event: 'blur' }),
  message: new Message(),
  ui:      new Bootstrap5(),
}
```

See the [Plugins reference](/plugins/) for full documentation on each plugin.
```

- [ ] **Step 3: Create `guide/localization.md`**

```markdown
# Localization

Validare ships default error messages in `en_US`. Pass a locale object to override all messages at once.

```js
import { validare, pt_BR } from 'validare';

const fv = validare(form, {
  locale: pt_BR,
  fields: {
    email: { validators: { notEmpty: {}, email: {} } },
  },
});
```

## Available Locales

| Locale | Language |
|---|---|
| `en_US` | English (default — no import needed) |
| `pt_BR` | Portuguese (Brazil) |

## Per-Field Override

Any `message` option on a validator overrides the locale default for that field:

```js
fields: {
  email: {
    validators: {
      email: { message: 'Endereço de e-mail inválido' },
    },
  },
},
```

## Adding a Custom Locale

Import and build a locale object matching the `LocaleData` interface, then pass it as `locale`:

```ts
import type { LocaleData } from 'validare';

const myLocale: LocaleData = {
  notEmpty:     { default: 'Este campo é obrigatório' },
  email:        { default: 'E-mail inválido' },
  // ... all 22+ validators
};

validare(form, { locale: myLocale, fields: { /* ... */ } });
```
```

- [ ] **Step 4: Create `guide/custom-validators.md`**

```markdown
# Custom Validators

Three built-in validators let you write custom validation logic.

## `callback` — Synchronous

```js
fields: {
  username: {
    validators: {
      callback: {
        message: 'Username must start with a letter',
        callback: (input) => ({
          valid: /^[a-zA-Z]/.test(input.value),
        }),
      },
    },
  },
},
```

The `callback` function receives a `ValidatorInput` object with `value`, `element`, `field`, and `elements`.

## `promise` — Asynchronous

```js
fields: {
  username: {
    validators: {
      promise: {
        message: 'Username is already taken',
        promise: async (input) => {
          const res = await fetch(`/api/check-username?q=${input.value}`);
          const data = await res.json();
          return { valid: data.available };
        },
      },
    },
  },
},
```

## `remote` — HTTP endpoint

```js
fields: {
  email: {
    validators: {
      remote: {
        url: '/api/validate-email',
        method: 'GET',           // default
        message: 'Email already registered',
        // The validator appends ?field=email&value=<input> to the URL.
        // The endpoint must return: { valid: true } or { valid: false, message: '...' }
      },
    },
  },
},
```

## Returning a Custom Message

Any validator can return a custom message alongside the result:

```js
callback: (input) => ({
  valid: false,
  message: `"${input.value}" is not allowed`,
}),
```
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add guide/
git commit -m "feat: add guide pages (getting-started, plugins, localization, custom-validators)"
```

---

## Task 5: Validators Index + API Reference

**Files:**
- Create: `validators/index.md`
- Create: `api/index.md`

- [ ] **Step 1: Create `validators/index.md`**

```markdown
# Validators

Validare ships 50 built-in validators across 7 categories.
All validators pass on empty string — combine with [`notEmpty`](/validators/notEmpty) to require a value.

## Core (22)

| Validator | Description |
|---|---|
| [notEmpty](/validators/notEmpty) | Not empty (supports `trim`) |
| [email](/validators/email) | Valid email address |
| [creditCard](/validators/creditCard) | Credit card number (Luhn check) |
| [date](/validators/date) | Date in a specified format |
| [digits](/validators/digits) | Digits only |
| [integer](/validators/integer) | Integer (positive or negative) |
| [numeric](/validators/numeric) | Numeric value |
| [regexp](/validators/regexp) | Matches a regular expression |
| [uri](/validators/uri) | Valid URL |
| [identical](/validators/identical) | Equal to another field |
| [different](/validators/different) | Different from another field |
| [between](/validators/between) | Between min and max |
| [greaterThan](/validators/greaterThan) | Greater than (or equal to) a value |
| [lessThan](/validators/lessThan) | Less than (or equal to) a value |
| [stringLength](/validators/stringLength) | String length (min/max) |
| [stringCase](/validators/stringCase) | Uppercase or lowercase |
| [choice](/validators/choice) | Number of checked checkboxes |
| [file](/validators/file) | File type and size |
| [callback](/validators/callback) | Custom synchronous function |
| [promise](/validators/promise) | Custom async function |
| [remote](/validators/remote) | Remote validation via HTTP |
| [ip](/validators/ip) | IP address (IPv4 and IPv6) |

## Format & Encoding (6)

| Validator | Description |
|---|---|
| [base64](/validators/base64) | Base64-encoded string |
| [hex](/validators/hex) | Hexadecimal number |
| [mac](/validators/mac) | MAC address |
| [bic](/validators/bic) | BIC/SWIFT code |
| [uuid](/validators/uuid) | UUID (v3, v4, v5) |
| [color](/validators/color) | CSS color (#hex, rgb, hsl, named) |

## Financial Instruments (6)

| Validator | Description |
|---|---|
| [iban](/validators/iban) | IBAN (77 countries) |
| [vat](/validators/vat) | VAT number (requires `country`) |
| [cusip](/validators/cusip) | CUSIP (North American securities) |
| [isin](/validators/isin) | ISIN (International Securities Identification Number) |
| [sedol](/validators/sedol) | SEDOL (London Stock Exchange) |
| [grid](/validators/grid) | GRId (Global Release Identifier) |

## Publication Codes (4)

| Validator | Description |
|---|---|
| [ean](/validators/ean) | EAN barcode (EAN-8 and EAN-13) |
| [isbn](/validators/isbn) | ISBN-10 and ISBN-13 |
| [ismn](/validators/ismn) | ISMN (International Standard Music Number) |
| [issn](/validators/issn) | ISSN (International Standard Serial Number) |

## Device & Vehicle (5)

| Validator | Description |
|---|---|
| [imei](/validators/imei) | IMEI (mobile device identifier) |
| [imo](/validators/imo) | IMO vessel number |
| [meid](/validators/meid) | MEID (CDMA device identifier) |
| [step](/validators/step) | Multiple of a step value |
| [vin](/validators/vin) | VIN (Vehicle Identification Number, USA) |

## Tax & Business (4)

| Validator | Description |
|---|---|
| [ein](/validators/ein) | EIN (US Employer Identification Number) |
| [rtn](/validators/rtn) | RTN (US Routing Transit Number) |
| [siren](/validators/siren) | SIREN (French company identifier) |
| [siret](/validators/siret) | SIRET (French establishment identifier) |

## Identity & Geographic (3)

| Validator | Description |
|---|---|
| [id](/validators/id) | National ID number (42 countries, requires `country`) |
| [phone](/validators/phone) | Phone number (requires `country`) |
| [zipCode](/validators/zipCode) | Postal/ZIP code (requires `country`) |
```

- [ ] **Step 2: Create `api/index.md`**

```markdown
---
outline: deep
---

# API Reference

## `validare(form, options)`

Creates a Validare instance with all built-in validators pre-registered.

```ts
import { validare } from 'validare';

const fv = validare(form: HTMLFormElement, options: ValidareOptions): Core
```

### `ValidareOptions`

```ts
interface ValidareOptions {
  fields:   Record<string, FieldOptions>;
  plugins?: Record<string, Plugin>;
  locale?:  LocaleData;
}

interface FieldOptions {
  validators: Record<string, ValidatorOptions>;
  enabled?:   boolean;   // default: true
}

interface ValidatorOptions {
  message?:  string;     // overrides locale default
  enabled?:  boolean;    // default: true
  [key: string]: unknown;
}
```

---

## Core instance methods

### `fv.validate()`

Validates all fields.

```ts
fv.validate(): Promise<'Valid' | 'Invalid' | 'NotValidated'>
```

### `fv.validateField(field)`

Validates a single field by name.

```ts
fv.validateField(field: string): Promise<'Valid' | 'Invalid' | 'NotValidated'>
```

### `fv.addField(field, options)`

Adds a field to the validator after initialisation.

```ts
fv.addField(field: string, options: FieldOptions): Core
```

### `fv.removeField(field)`

Removes a field and its validators.

```ts
fv.removeField(field: string): Core
```

### `fv.enableValidator(field, validator)` / `fv.disableValidator(field, validator)`

Enables or disables a specific validator for a field.

```ts
fv.enableValidator(field: string, validator: string): Core
fv.disableValidator(field: string, validator: string): Core
```

### `fv.resetField(field)` / `fv.reset()`

Resets validation state for one field or the entire form.

```ts
fv.resetField(field: string): Core
fv.reset(): Core
```

### `fv.destroy()`

Removes all event listeners, uninstalls plugins, and cleans up.

```ts
fv.destroy(): void
```

### `fv.on(event, handler)` / `fv.off(event, handler)`

Subscribe/unsubscribe to core events.

```ts
fv.on(event: string, handler: (payload: unknown) => void): Core
fv.off(event: string, handler: (payload: unknown) => void): Core
```

---

## Events

| Event | Payload | Fires when |
|---|---|---|
| `core.form.validating` | `{ instance }` | Before all fields validate |
| `core.form.valid` | `{ instance }` | All fields Valid |
| `core.form.invalid` | `{ instance }` | At least one Invalid |
| `core.form.notvalidated` | `{ instance }` | At least one NotValidated |
| `core.form.reset` | `{ instance }` | After `reset()` |
| `core.field.added` | `{ field, elements, options }` | `addField()` |
| `core.field.removed` | `{ field, elements, options }` | `removeField()` |
| `core.field.validating` | `{ field }` | Before a field validates |
| `core.field.validated` | `{ field, result, elements }` | After a field validates |
| `core.element.validated` | `ElementValidatedPayload` | After each DOM element validates |
| `core.validator.validated` | `{ field, validator, result }` | After each validator runs |

### `ElementValidatedPayload`

```ts
interface ElementValidatedPayload {
  field:      string;
  element:    HTMLElement;
  elements:   HTMLElement[];
  valid:      boolean;
  result:     'Valid' | 'Invalid' | 'NotValidated';
  validators: Record<string, {
    valid:    boolean;
    message:  string;
    result:   'Valid' | 'Invalid' | 'NotValidated';
  }>;
}
```

---

## Validation status

| Value | Meaning |
|---|---|
| `'Valid'` | All validators passed |
| `'Invalid'` | At least one validator failed |
| `'NotValidated'` | Field has not been validated yet |
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add validators/index.md api/index.md
git commit -m "feat: add validators index and API reference"
```

---

## Task 6: Core Validator Pages (22 pages)

**Files:** Create all 22 files under `validators/`.

**Content source:** Read `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/validators/<name>.md` for each validator to get the Options table, Valid/Invalid values, and Notes. Adapt to VitePress format (see template below).

### Page template

Every validator page follows this structure:

```markdown
---
outline: deep
---

# `<name>`

<one-line description from source doc>

## Options

<options table from source doc — rename "## Options" if it differs>

## Playground

<script setup>
const code = `<playground code — see table below>`
</script>

<ValidarePlayground :code="code" />

## Valid values

<table from source doc>

## Invalid values

<table from source doc>

## Notes

<notes from source doc, if any>
```

**Important:** In the `<script setup>` block, the `code` variable is a JavaScript template literal. If the playground code itself contains template literals (backtick strings), escape the inner backticks as `` \` `` and `${` as `\${`.

### Playground code for each validator

The playground code always follows this base pattern — variations noted per validator:

```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>LABEL</label>
      <input type="TYPE" name="val" placeholder="PLACEHOLDER">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { val: { validators: { VALIDATOR: OPTIONS } } },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

| Validator | Label | Input type | Placeholder | Validator config |
|---|---|---|---|---|
| `notEmpty` | "Full name" | `text` | "Jane Doe" | `notEmpty: { trim: true }` |
| `email` | "Email" | `email` | "user@example.com" | `email: {}` |
| `creditCard` | "Card number" | `text` | "4111 1111 1111 1111" | `creditCard: {}` |
| `date` | "Date (YYYY-MM-DD)" | `text` | "2025-12-31" | `date: { format: 'YYYY-MM-DD' }` |
| `digits` | "Digits only" | `text` | "12345" | `digits: {}` |
| `integer` | "Integer" | `text` | "-42 or 100" | `integer: {}` |
| `numeric` | "Numeric" | `text` | "3.14" | `numeric: {}` |
| `regexp` | "Lowercase letters" | `text` | "hello" | `regexp: { regexp: /^[a-z]+$/, message: 'Lowercase letters only' }` |
| `uri` | "URL" | `url` | "https://example.com" | `uri: {}` |
| `ip` | "IP address" | `text` | "192.168.1.1" | `ip: {}` |
| `base64` (Task 7) | "Base64 string" | `text` | "SGVsbG8gV29ybGQ=" | `base64: {}` |
| `hex` (Task 7) | "Hex number" | `text` | "1a2b3c" | `hex: {}` |
| `mac` (Task 7) | "MAC address" | `text` | "00:11:22:33:44:55" | `mac: {}` |
| `bic` (Task 7) | "BIC/SWIFT code" | `text` | "DEUTDEDB" | `bic: {}` |
| `uuid` (Task 7) | "UUID" | `text` | "550e8400-e29b-41d4-a716-446655440000" | `uuid: { version: 4 }` |
| `color` (Task 7) | "CSS color" | `text` | "#ff5733" | `color: {}` |
| `iban` (Task 7) | "IBAN" | `text` | "GB82 WEST 1234 5698 7654 32" | `iban: {}` |
| `vat` (Task 7) | "VAT number (GB)" | `text` | "GB123456789" | `vat: { country: 'GB' }` |
| `cusip` (Task 7) | "CUSIP" | `text` | "037833100" | `cusip: {}` |
| `isin` (Task 7) | "ISIN" | `text` | "US0378331005" | `isin: {}` |
| `sedol` (Task 7) | "SEDOL" | `text` | "B0WNLY7" | `sedol: {}` |
| `grid` (Task 7) | "GRId" | `text` | "A1-2425G-ABC1234002-M" | `grid: {}` |
| `ean` (Task 8) | "EAN barcode" | `text` | "4006381333931" | `ean: {}` |
| `isbn` (Task 8) | "ISBN" | `text` | "978-3-16-148410-0" | `isbn: {}` |
| `ismn` (Task 8) | "ISMN" | `text` | "979-0-2600-0043-8" | `ismn: {}` |
| `issn` (Task 8) | "ISSN" | `text` | "0378-5955" | `issn: {}` |
| `imei` (Task 8) | "IMEI" | `text` | "490154203237518" | `imei: {}` |
| `imo` (Task 8) | "IMO number" | `text` | "IMO 9074729" | `imo: {}` |
| `meid` (Task 8) | "MEID" | `text` | "AF012389ABE2" | `meid: {}` |
| `step` (Task 8) | "Multiple of 5" | `number` | "0, 5, 10..." | `step: { base: 0, step: 5 }` |
| `vin` (Task 8) | "VIN (USA)" | `text` | "1HGBH41JXMN109186" | `vin: {}` |
| `ein` (Task 8) | "EIN" | `text` | "12-3456789" | `ein: {}` |
| `rtn` (Task 8) | "Routing number" | `text` | "021000021" | `rtn: {}` |
| `siren` (Task 8) | "SIREN" | `text` | "552 144 503" | `siren: {}` |
| `siret` (Task 8) | "SIRET" | `text` | "55214450300135" | `siret: {}` |
| `id` (Task 8) | "US SSN" | `text` | "123-45-6789" | `id: { country: 'US' }` |
| `phone` (Task 8) | "US phone" | `tel` | "(201) 555-0123" | `phone: { country: 'US' }` |
| `zipCode` (Task 8) | "US ZIP code" | `text` | "90210" | `zipCode: { country: 'US' }` |

### Special playground codes (validators that need non-standard HTML)

**`between`** — number input:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Number (between 1 and 100)</label>
      <input type="number" name="val" placeholder="e.g. 42">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { val: { validators: { between: { min: 1, max: 100, inclusive: true } } } },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`greaterThan`** — number input:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Number (greater than 0)</label>
      <input type="number" name="val" placeholder="e.g. 5">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { val: { validators: { greaterThan: { value: 0, inclusive: false } } } },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`lessThan`** — number input:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Number (less than 100)</label>
      <input type="number" name="val" placeholder="e.g. 50">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { val: { validators: { lessThan: { value: 100, inclusive: false } } } },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`stringLength`**:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Username (8–20 characters)</label>
      <input type="text" name="val" placeholder="myusername">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { val: { validators: { stringLength: { min: 8, max: 20 } } } },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`stringCase`**:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Country code (uppercase)</label>
      <input type="text" name="val" placeholder="US">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { val: { validators: { stringCase: { case: 'upper' } } } },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`identical`** — two fields:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Password</label>
      <input type="password" name="password" placeholder="Password">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Confirm password</label>
      <input type="password" name="confirm" placeholder="Confirm password">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    password: { validators: { notEmpty: {} } },
    confirm:  { validators: { identical: { compare: 'password', message: 'Passwords do not match' } } }
  },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`different`** — two fields:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Username</label>
      <input type="text" name="username" placeholder="Username">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Email (must differ from username)</label>
      <input type="email" name="email" placeholder="Email">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    username: { validators: { notEmpty: {} } },
    email:    { validators: { different: { compare: 'username', message: 'Email must differ from username' } } }
  },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`choice`** — checkboxes:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <fieldset class="field">
      <legend>Pick 1–3 interests</legend>
      <label><input type="checkbox" name="val" value="sports"> Sports</label>
      <label><input type="checkbox" name="val" value="music"> Music</label>
      <label><input type="checkbox" name="val" value="travel"> Travel</label>
      <label><input type="checkbox" name="val" value="food"> Food</label>
      <div class="fv-plugins-message-container"></div>
    </fieldset>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { val: { validators: { choice: { min: 1, max: 3 } } } },
  plugins: { trigger: new Trigger({ event: 'change' }), message: new Message() }
});
```

**`file`** — file input:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Image (JPG/PNG, max 2 MB)</label>
      <input type="file" name="val" accept=".jpg,.png">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { val: { validators: { file: { extension: 'jpg,png', maxSize: 2097152, message: 'JPG or PNG, max 2 MB' } } } },
  plugins: { trigger: new Trigger({ event: 'change' }), message: new Message() }
});
```

**`callback`**:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Username (must start with a letter)</label>
      <input type="text" name="val" placeholder="username">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    val: {
      validators: {
        callback: {
          message: 'Must start with a letter',
          callback: (input) => ({ valid: /^[a-zA-Z]/.test(input.value) })
        }
      }
    }
  },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`promise`**:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Code (async check — valid if length > 3)</label>
      <input type="text" name="val" placeholder="e.g. ABCD">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    val: {
      validators: {
        promise: {
          message: 'Code must be longer than 3 characters',
          promise: (input) =>
            new Promise(resolve =>
              setTimeout(() => resolve({ valid: input.value.length > 3 }), 400)
            )
        }
      }
    }
  },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

**`remote`** — simulated with promise (real `remote` requires a server):
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Username (try "admin" — already taken)</label>
      <input type="text" name="val" placeholder="username">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
// Simulated with promise validator (real usage: use the remote validator with a server endpoint)
validare(document.getElementById('demo'), {
  fields: {
    val: {
      validators: {
        promise: {
          message: 'Username is already taken',
          promise: (input) =>
            new Promise(resolve =>
              setTimeout(() => resolve({ valid: input.value !== 'admin' }), 400)
            )
        }
      }
    }
  },
  plugins: { trigger: new Trigger({ event: 'blur' }), message: new Message() }
});
```

> Note: Add a comment in `remote.md` explaining that the playground uses `promise` to simulate remote validation because a real server endpoint is unavailable in the browser sandbox. Show the real `remote` validator config in a code block.

- [ ] **Step 1: Create all 22 core validator pages**

Create each file under `validators/`. For each:
1. Read the source doc from `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/validators/<name>.md`
2. Apply the page template above
3. Use the playground code from the table (or the special code blocks for complex validators)

Files to create:
`validators/notEmpty.md`, `validators/email.md`, `validators/creditCard.md`, `validators/date.md`, `validators/digits.md`, `validators/integer.md`, `validators/numeric.md`, `validators/regexp.md`, `validators/uri.md`, `validators/identical.md`, `validators/different.md`, `validators/between.md`, `validators/greaterThan.md`, `validators/lessThan.md`, `validators/stringLength.md`, `validators/stringCase.md`, `validators/choice.md`, `validators/file.md`, `validators/callback.md`, `validators/promise.md`, `validators/remote.md`, `validators/ip.md`

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add validators/
git commit -m "feat: add 22 core validator pages with playground"
```

---

## Task 7: Format & Financial Validator Pages (12 pages)

**Files:** Create 12 files under `validators/`.

Use the same page template as Task 6. Playground codes are in the table in Task 6 (rows marked "Task 7").

- [ ] **Step 1: Create Format & Encoding pages**

Read source docs, apply template, add playground code from Task 6 table.

Files: `validators/base64.md`, `validators/hex.md`, `validators/mac.md`, `validators/bic.md`, `validators/uuid.md`, `validators/color.md`

- [ ] **Step 2: Create Financial pages**

Files: `validators/iban.md`, `validators/vat.md`, `validators/cusip.md`, `validators/isin.md`, `validators/sedol.md`, `validators/grid.md`

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add validators/base64.md validators/hex.md validators/mac.md validators/bic.md validators/uuid.md validators/color.md validators/iban.md validators/vat.md validators/cusip.md validators/isin.md validators/sedol.md validators/grid.md
git commit -m "feat: add Format & Encoding and Financial validator pages"
```

---

## Task 8: Publication + Device + Tax + Identity Validator Pages (16 pages)

**Files:** Create 16 files under `validators/`.

Use the same page template. Playground codes are in the table in Task 6 (rows marked "Task 8").

- [ ] **Step 1: Create Publication pages**

Files: `validators/ean.md`, `validators/isbn.md`, `validators/ismn.md`, `validators/issn.md`

- [ ] **Step 2: Create Device & Vehicle pages**

Files: `validators/imei.md`, `validators/imo.md`, `validators/meid.md`, `validators/step.md`, `validators/vin.md`

- [ ] **Step 3: Create Tax & Business pages**

Files: `validators/ein.md`, `validators/rtn.md`, `validators/siren.md`, `validators/siret.md`

- [ ] **Step 4: Create Identity & Geographic pages**

Files: `validators/id.md`, `validators/phone.md`, `validators/zipCode.md`

For `id.md` — add a note that the playground uses `country: 'US'` (SSN format) and list some other supported countries. Read `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/validators/id.md` for the full country list.

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add validators/ean.md validators/isbn.md validators/ismn.md validators/issn.md validators/imei.md validators/imo.md validators/meid.md validators/step.md validators/vin.md validators/ein.md validators/rtn.md validators/siren.md validators/siret.md validators/id.md validators/phone.md validators/zipCode.md
git commit -m "feat: add Publication, Device, Tax, and Identity validator pages"
```

---

## Task 9: Core Plugin Pages + Plugin Index (7 files)

**Files:**
- Create: `plugins/index.md`
- Create: `plugins/Trigger.md`, `plugins/Message.md`, `plugins/Icon.md`, `plugins/SubmitButton.md`, `plugins/Excluded.md`, `plugins/Sequence.md`

**Content source:** Read `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/plugins/<Name>.md` for each plugin.

### Plugin page template

```markdown
---
outline: deep
---

# `<Name>` Plugin

<one-line description>

## Options

<options table from source doc>

## Playground

<script setup>
const code = `<playground code>`
</script>

<ValidarePlayground :code="code" height="320px" />

## Notes

<notes from source doc>
```

### Playground codes for core plugins

**`Trigger`** — demonstrates per-field event mapping:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Email (validates on blur)</label>
      <input type="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <div class="field">
      <label>Username (validates on every keystroke)</label>
      <input type="text" name="username" placeholder="Type to validate live">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate all</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    email:    { validators: { notEmpty: {}, email: {} } },
    username: { validators: { notEmpty: {}, stringLength: { min: 3, max: 20 } } }
  },
  plugins: {
    trigger:  new Trigger({ event: { email: 'blur', username: 'input' } }),
    message:  new Message()
  }
});
```

**`Message`** — demonstrates custom container selector:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message } = Validare;
validare(document.getElementById('demo'), {
  fields: { email: { validators: { notEmpty: {}, email: {} } } },
  plugins: {
    trigger:  new Trigger({ event: 'blur' }),
    message:  new Message()
  }
});
```

**`Icon`** — shows valid ✓ / invalid ✗ icons after the input:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message, Icon } = Validare;
validare(document.getElementById('demo'), {
  fields: { email: { validators: { notEmpty: {}, email: {} } } },
  plugins: {
    trigger:  new Trigger({ event: 'blur' }),
    message:  new Message(),
    icon:     new Icon({ valid: '✓', invalid: '✗', validating: '…' })
  }
});
```

**`SubmitButton`** — disables the submit button while validating:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Submit</button>
  </form>
`;
const { validare, Trigger, Message, SubmitButton } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    email: {
      validators: {
        promise: {
          promise: (i) => new Promise(r => setTimeout(() => r({ valid: i.value.includes('@') }), 800))
        }
      }
    }
  },
  plugins: {
    trigger:      new Trigger({ event: 'blur' }),
    message:      new Message(),
    submitButton: new SubmitButton()
  }
});
```

**`Excluded`** — skips hidden and disabled fields:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Visible field</label>
      <input type="text" name="visible" placeholder="This is validated">
      <div class="fv-plugins-message-container"></div>
    </div>
    <input type="hidden" name="hidden" value="">
    <div class="field">
      <label>Disabled field (skipped)</label>
      <input type="text" name="disabled" disabled placeholder="This is skipped">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message, Excluded } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    visible:  { validators: { notEmpty: {} } },
    hidden:   { validators: { notEmpty: {} } },
    disabled: { validators: { notEmpty: {} } }
  },
  plugins: {
    trigger:  new Trigger({ event: 'blur' }),
    message:  new Message(),
    excluded: new Excluded()
  }
});
```

**`Sequence`** — stops at the first failing validator per field:
```js
document.body.innerHTML = `
  <form id="demo" novalidate>
    <div class="field">
      <label>Email (stops at first error)</label>
      <input type="email" name="email" placeholder="user@example.com">
      <div class="fv-plugins-message-container"></div>
    </div>
    <button type="submit">Validate</button>
  </form>
`;
const { validare, Trigger, Message, Sequence } = Validare;
validare(document.getElementById('demo'), {
  fields: {
    email: {
      validators: {
        notEmpty: { message: 'Email is required' },
        email:    { message: 'Please enter a valid email address' }
      }
    }
  },
  plugins: {
    trigger:  new Trigger({ event: 'blur' }),
    message:  new Message(),
    sequence: new Sequence()
  }
});
```

- [ ] **Step 1: Create `plugins/index.md`**

```markdown
# Plugins

Plugins extend the Validare core engine. Pass them in the `plugins` option map.

## Core Plugins

| Plugin | Description |
|---|---|
| [Trigger](/plugins/Trigger) | Validates on DOM events (`blur`, `input`, `change`) |
| [Message](/plugins/Message) | Displays error messages in the DOM |
| [Icon](/plugins/Icon) | Shows valid/invalid icons next to fields |
| [SubmitButton](/plugins/SubmitButton) | Disables the submit button during validation |
| [Excluded](/plugins/Excluded) | Skips disabled, hidden, or invisible fields |
| [Sequence](/plugins/Sequence) | Stops validation at the first failing validator per field |

## CSS Framework Plugins

| Plugin | Framework |
|---|---|
| [Bootstrap5](/plugins/Bootstrap5) | Applies Bootstrap 5 `is-valid` / `is-invalid` classes |
| [Bulma](/plugins/Bulma) | Applies Bulma `is-success` / `is-danger` classes |
| [Tailwind](/plugins/Tailwind) | Applies configurable Tailwind utility classes |
```

- [ ] **Step 2: Create the 6 core plugin pages**

For each plugin:
1. Read the source doc from `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/plugins/<Name>.md`
2. Apply the plugin page template above
3. Use the playground code from the section above

Files: `plugins/Trigger.md`, `plugins/Message.md`, `plugins/Icon.md`, `plugins/SubmitButton.md`, `plugins/Excluded.md`, `plugins/Sequence.md`

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add plugins/
git commit -m "feat: add plugin index and 6 core plugin pages"
```

---

## Task 10: CSS Framework Plugin Pages (3 pages)

**Files:**
- Create: `plugins/Bootstrap5.md`
- Create: `plugins/Bulma.md`
- Create: `plugins/Tailwind.md`

Use the plugin page template from Task 9. These pages load CSS framework styles inside the iframe via a CDN `<link>` tag embedded in the playground code.

### Playground codes for CSS framework plugins

**`Bootstrap5`** — loads Bootstrap 5 CDN, uses `is-valid`/`is-invalid` classes:
```js
// Inject Bootstrap 5 stylesheet into the iframe head
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
document.head.appendChild(link);

document.body.innerHTML = `
  <div style="padding:1rem;max-width:400px">
    <div class="mb-3">
      <label for="name" class="form-label">Full Name</label>
      <input type="text" id="name" name="name" class="form-control" placeholder="Jane Doe">
    </div>
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input type="email" id="email" name="email" class="form-control" placeholder="jane@example.com">
    </div>
    <button type="submit" class="btn btn-primary" form="bs-demo">Submit</button>
  </div>
`;

// Wrap in a form
const form = document.createElement('form');
form.id = 'bs-demo';
form.noValidate = true;
form.appendChild(document.body.firstElementChild);
document.body.appendChild(form);

const { validare, Trigger, Bootstrap5 } = Validare;
validare(form, {
  fields: {
    name:  { validators: { notEmpty: {}, stringLength: { min: 2 } } },
    email: { validators: { notEmpty: {}, email: {} } }
  },
  plugins: {
    trigger: new Trigger({ event: 'blur' }),
    ui:      new Bootstrap5()
  }
});
```

**`Bulma`** — loads Bulma CDN:
```js
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css';
document.head.appendChild(link);

const form = document.createElement('form');
form.id = 'bulma-demo';
form.noValidate = true;
form.style.padding = '1rem';
form.style.maxWidth = '400px';
form.innerHTML = `
  <div class="field">
    <label class="label" for="name">Full Name</label>
    <div class="control">
      <input type="text" id="name" name="name" class="input" placeholder="Jane Doe">
    </div>
  </div>
  <div class="field">
    <label class="label" for="email">Email</label>
    <div class="control">
      <input type="email" id="email" name="email" class="input" placeholder="jane@example.com">
    </div>
  </div>
  <div class="field">
    <div class="control">
      <button type="submit" class="button is-primary">Submit</button>
    </div>
  </div>
`;
document.body.appendChild(form);

const { validare, Trigger, Bulma } = Validare;
validare(form, {
  fields: {
    name:  { validators: { notEmpty: {}, stringLength: { min: 2 } } },
    email: { validators: { notEmpty: {}, email: {} } }
  },
  plugins: {
    trigger: new Trigger({ event: 'blur' }),
    ui:      new Bulma()
  }
});
```

**`Tailwind`** — loads Tailwind CDN, requires explicit class options:
```js
const script = document.createElement('script');
script.src = 'https://cdn.tailwindcss.com';
document.head.appendChild(script);

script.onload = () => {
  const form = document.createElement('form');
  form.id = 'tw-demo';
  form.noValidate = true;
  form.className = 'p-4 max-w-sm';
  form.innerHTML = `
    <div class="mb-4">
      <label class="block font-medium mb-1" for="name">Full Name</label>
      <input type="text" id="name" name="name"
             class="w-full border rounded px-3 py-2 text-sm"
             placeholder="Jane Doe">
      <div class="fv-plugins-message-container text-red-600 text-xs mt-1"></div>
    </div>
    <div class="mb-4">
      <label class="block font-medium mb-1" for="email">Email</label>
      <input type="email" id="email" name="email"
             class="w-full border rounded px-3 py-2 text-sm"
             placeholder="jane@example.com">
      <div class="fv-plugins-message-container text-red-600 text-xs mt-1"></div>
    </div>
    <button type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
      Submit
    </button>
  `;
  document.body.appendChild(form);

  const { validare, Trigger, Message, Tailwind } = Validare;
  validare(form, {
    fields: {
      name:  { validators: { notEmpty: {}, stringLength: { min: 2 } } },
      email: { validators: { notEmpty: {}, email: {} } }
    },
    plugins: {
      trigger: new Trigger({ event: 'blur' }),
      message: new Message(),
      ui:      new Tailwind({ validClass: 'border-green-500', invalidClass: 'border-red-500' })
    }
  });
};
```

> **Note for `Tailwind.md`:** The `Tailwind` plugin has no default classes. Always pass `validClass` and `invalidClass` options. Also add `Message` plugin to show error text.

- [ ] **Step 1: Create the 3 CSS framework plugin pages**

For each plugin:
1. Read the source doc from `/Users/varantes/workspace/sandbox/jvalidation/validare/docs/plugins/<Name>.md`
2. Apply the plugin page template from Task 9
3. Use the playground code from the section above

Files: `plugins/Bootstrap5.md`, `plugins/Bulma.md`, `plugins/Tailwind.md`

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Expected: no errors. Run `npm run dev` and open each CSS framework plugin page to confirm CDN loads and the playground renders with correct styling.

- [ ] **Step 3: Final build check**

```bash
npm run build 2>&1 | tail -5
```

Expected output ends with `build complete` and a reported bundle size. No warnings about missing components or broken links.

- [ ] **Step 4: Commit**

```bash
git add plugins/Bootstrap5.md plugins/Bulma.md plugins/Tailwind.md
git commit -m "feat: add Bootstrap5, Bulma, Tailwind plugin pages — site complete"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Landing page with hero, features, playground demo, install block
- ✅ Guide: getting-started, plugins, localization, custom-validators
- ✅ All 50 validator pages with playground
- ✅ All 9 plugin pages with playground
- ✅ API reference with all Core methods, events, and payload types
- ✅ ValidarePlayground component (CodeMirror + iframe sandbox + debounce + reset + error display)
- ✅ GitHub Actions deploy workflow
- ✅ `scripts/update-bundle.sh` helper
- ✅ VitePress config with full nav + sidebar for all sections
- ✅ Search (VitePress local search, no extra config needed — `search: { provider: 'local' }` in config)

**Placeholder check:** No TBD/TODO found.

**Type consistency:**
- `ValidarePlayground.vue` props: `code: string`, `height?: string` — used consistently in all pages
- `buildSrcdoc(userCode: string)` — takes the editor content, not the prop; consistent
- All playground codes use `const { validare, ... } = Validare` (UMD global) — consistent
