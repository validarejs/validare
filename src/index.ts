// src/index.ts
// Core engine + factory
export { validare, Core, Plugin } from './core/index';
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

// Validators and plugins will be exported here as they are implemented
// (see plan-2-validators and plan-3-plugins)
