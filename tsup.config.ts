import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'validators/index': 'src/validators/index.ts',
      'plugins/index': 'src/plugins/index.ts',
      'locales/index': 'src/locales/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'es2020',
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'Validare',
    outExtension: () => ({ js: '.umd.js' }),
    minify: true,
    target: 'es2020',
  },
]);
