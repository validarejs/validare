// src/index.ts
import { Core } from './core/Core';
import { type ValidareOptions } from './core/index';
import * as builtinValidators from './validators/index';

/**
 * Create a Validare instance with all built-in validators pre-registered.
 * Users reference validators by name string in field config:
 *   validators: { notEmpty: {}, email: { message: 'Invalid' } }
 */
export function validare(form: HTMLFormElement, options: ValidareOptions): Core {
  const { fields, plugins = {}, locale } = options;
  const core = new Core(form);

  // Pre-register all 22 built-in validators
  for (const [name, factory] of Object.entries(builtinValidators)) {
    core.registerValidator(name, factory);
  }

  if (locale) core.setLocale(locale);

  for (const [field, opts] of Object.entries(fields)) {
    core.addField(field, opts);
  }

  for (const [name, plugin] of Object.entries(plugins)) {
    core.registerPlugin(name, plugin);
  }

  return core;
}

// Re-export core types and classes
export { Core } from './core/Core';
export { Plugin } from './core/Plugin';
export type {
  ValidareOptions,
  ValidatorInput,
  ValidatorResult,
  ValidatorObject,
  ValidatorFactory,
  ValidationStatus,
  FieldOptions,
  ValidatorOptions,
  LocaleData,
  ElementValidatedPayload,
} from './core/index';

// Re-export validators (for advanced users who want to register manually)
export * from './validators/index';
