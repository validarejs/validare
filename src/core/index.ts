// src/core/index.ts
import { Core } from "./Core";
import type { Plugin } from "./Plugin";
import type { FieldOptions, LocaleData } from "./types";

export interface ValidareOptions {
  /** Plugins to register, keyed by name */
  plugins?: Record<string, Plugin>;
  /** Field definitions */
  fields: Record<string, FieldOptions>;
  /** Locale data for error messages */
  locale?: LocaleData;
}

/**
 * Create a Validare instance for the given form.
 *
 * @example
 * const fv = validare(document.getElementById('myForm'), {
 *   plugins: { trigger: new Trigger({ event: 'blur' }) },
 *   fields: {
 *     email: { validators: { notEmpty: { message: 'Required' }, email: {} } }
 *   }
 * });
 */
export function validare(form: HTMLFormElement, options: ValidareOptions): Core {
  const { fields, plugins = {}, locale } = options;
  const core = new Core(form);

  if (locale) core.setLocale(locale);

  // Register fields (queries DOM elements)
  for (const [field, opts] of Object.entries(fields)) {
    core.addField(field, opts);
  }

  // Register plugins (calls setCore + install)
  for (const [name, plugin] of Object.entries(plugins)) {
    core.registerPlugin(name, plugin);
  }

  return core;
}

// Re-export everything consumers need from core
export { Core } from "./Core";
export { Plugin } from "./Plugin";
export type {
  ValidatorInput,
  ValidatorResult,
  ValidatorObject,
  ValidatorFactory,
  ValidationStatus,
  FieldOptions,
  ValidatorOptions,
  LocaleData,
  ElementValidatedPayload,
} from "./types";
