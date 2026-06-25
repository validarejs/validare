// src/core/types.ts

/** Result of a single field validation run */
export type ValidationStatus = "Valid" | "Invalid" | "NotValidated";

/** Input passed to every validator's validate() method */
export interface ValidatorInput {
  /** Current value of the field element */
  value: string;
  /** Options configured by the user for this validator (e.g. { message, min, max }) */
  options: Record<string, unknown>;
  /** Name of the field being validated */
  field: string;
  /** All DOM elements associated with the field */
  elements: HTMLElement[];
  /** The form element */
  form: HTMLFormElement;
}

/** What a validator's validate() method returns */
export interface ValidatorResult {
  valid: boolean;
  /** If provided, overrides the message from locale/options */
  message?: string;
  /** Extra data returned by the validator (e.g. detected credit card type) */
  meta?: Record<string, unknown>;
}

/** The object returned by a ValidatorFactory */
export interface ValidatorObject {
  validate(input: ValidatorInput): ValidatorResult | Promise<ValidatorResult>;
}

/** A validator is a zero-argument factory that returns a ValidatorObject */
export type ValidatorFactory = () => ValidatorObject;

/** Per-validator config inside a field definition */
export interface ValidatorOptions {
  /** Custom error message — overrides locale */
  message?: string;
  /** Set to false to disable this validator without removing it */
  enabled?: boolean;
  [key: string]: unknown;
}

/** Field definition passed to validare() or addField() */
export interface FieldOptions {
  /** CSS selector to find the field elements. Defaults to [name="fieldName"] */
  selector?: string;
  /** Map of validator name → validator options */
  validators: Record<string, ValidatorOptions>;
}

/** Locale data: map of validatorName → { default: 'message', ... } */
export type LocaleData = Record<string, Record<string, string>>;

/** Payload for core.element.validated event */
export interface ElementValidatedPayload {
  field: string;
  element: HTMLElement;
  elements: HTMLElement[];
  valid: boolean;
  result: ValidationStatus;
  /** Per-validator results for this element */
  validators: Record<
    string,
    {
      valid: boolean;
      message: string;
      result: ValidationStatus;
    }
  >;
}
