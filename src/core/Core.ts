// src/core/Core.ts
import { type Emitter, createEmitter } from "./Emitter";
import { type Filter, createFilter } from "./Filter";
import type { Plugin } from "./Plugin";
import type {
  ElementValidatedPayload,
  FieldOptions,
  LocaleData,
  ValidationStatus,
  ValidatorFactory,
  ValidatorInput,
  ValidatorOptions,
} from "./types";

export class Core {
  readonly form: HTMLFormElement;

  private fields: Record<string, FieldOptions> = {};
  private elements: Record<string, HTMLElement[]> = {};
  private plugins: Record<string, Plugin> = {};
  private results = new Map<string, ValidationStatus>();
  private validatorResults = new Map<string, Record<string, ValidationStatus>>();
  private validators: Record<string, ValidatorFactory> = {};
  private locale: LocaleData = {};
  private emitter: Emitter;
  private filter: Filter;

  constructor(form: HTMLFormElement) {
    this.form = form;
    this.emitter = createEmitter();
    this.filter = createFilter();
  }

  // ─── Events ──────────────────────────────────────────────────────────────

  on(event: string, handler: (...args: unknown[]) => void): this {
    this.emitter.on(event, handler);
    return this;
  }

  off(event: string, handler: (...args: unknown[]) => void): this {
    this.emitter.off(event, handler);
    return this;
  }

  emit(event: string, ...args: unknown[]): this {
    this.emitter.emit(event, ...args);
    return this;
  }

  // ─── Filters ─────────────────────────────────────────────────────────────

  registerFilter(name: string, func: (...args: unknown[]) => unknown): this {
    this.filter.add(name, func);
    return this;
  }

  deregisterFilter(name: string, func: (...args: unknown[]) => unknown): this {
    this.filter.remove(name, func);
    return this;
  }

  executeFilter<T>(name: string, defaultValue: T, args: unknown[]): T {
    return this.filter.execute(name, defaultValue, args);
  }

  // ─── Plugins ─────────────────────────────────────────────────────────────

  registerPlugin(name: string, plugin: Plugin): this {
    if (this.plugins[name]) {
      throw new Error(`Plugin "${name}" is already registered`);
    }
    plugin.setCore(this);
    plugin.install();
    this.plugins[name] = plugin;
    return this;
  }

  deregisterPlugin(name: string): this {
    this.plugins[name]?.uninstall();
    delete this.plugins[name];
    return this;
  }

  enablePlugin(name: string): this {
    this.plugins[name]?.enable();
    return this;
  }

  disablePlugin(name: string): this {
    this.plugins[name]?.disable();
    return this;
  }

  // ─── Validators ───────────────────────────────────────────────────────────

  registerValidator(name: string, factory: ValidatorFactory): this {
    this.validators[name] = factory;
    return this;
  }

  /** Remove a single validator from a field's validator map. No-op if not found. */
  removeValidator(field: string, validatorName: string): this {
    const fieldOpts = this.fields[field];
    if (fieldOpts?.validators[validatorName]) {
      delete fieldOpts.validators[validatorName];
      // Invalidate caches so next validateField re-runs cleanly
      this.results.delete(field);
      const vr = this.validatorResults.get(field);
      if (vr) delete vr[validatorName];
    }
    return this;
  }

  /** Remove a validator factory from the global registry. No-op if not found. */
  deregisterValidator(name: string): this {
    delete this.validators[name];
    return this;
  }

  // ─── Fields ───────────────────────────────────────────────────────────────

  addField(field: string, options: FieldOptions): this {
    this.fields[field] = this.fields[field]
      ? {
          selector: options.selector ?? this.fields[field].selector,
          validators: { ...this.fields[field].validators, ...options.validators },
        }
      : options;
    this.elements[field] = this.queryElements(field);
    this.emit("core.field.added", {
      field,
      elements: this.elements[field],
      options: this.fields[field],
    });
    return this;
  }

  removeField(field: string): this {
    if (!this.fields[field]) {
      throw new Error(`Field "${field}" is not defined`);
    }
    const elements = this.elements[field];
    const options = this.fields[field];
    delete this.elements[field];
    delete this.fields[field];
    this.results.delete(field);
    this.validatorResults.delete(field);
    this.emit("core.field.removed", { field, elements, options });
    return this;
  }

  getFields(): Record<string, FieldOptions> {
    return { ...this.fields };
  }

  getElements(field: string): HTMLElement[] {
    return this.elements[field] ?? [];
  }

  getValidatorResult(field: string, validator: string): ValidationStatus {
    return this.validatorResults.get(field)?.[validator] ?? "NotValidated";
  }

  // ─── Locale ───────────────────────────────────────────────────────────────

  setLocale(locale: LocaleData): this {
    this.locale = locale;
    return this;
  }

  // ─── Validator control ────────────────────────────────────────────────────

  enableValidator(field: string, validator: string): this {
    const v = this.fields[field]?.validators[validator];
    if (v) {
      v.enabled = true;
      this.emit("core.validator.enabled", { field, validator });
    }
    return this;
  }

  disableValidator(field: string, validator: string): this {
    const v = this.fields[field]?.validators[validator];
    if (v) {
      v.enabled = false;
      this.emit("core.validator.disabled", { field, validator });
    }
    return this;
  }

  // ─── Validation ───────────────────────────────────────────────────────────

  validate(): Promise<ValidationStatus> {
    this.emit("core.form.validating", { instance: this });
    return this.filter
      .execute<Promise<void>>("validate-pre", Promise.resolve(), [])
      .then(() => Promise.all(Object.keys(this.fields).map((f) => this.validateField(f))))
      .then((results) => {
        if (results.includes("Invalid")) {
          this.emit("core.form.invalid", { instance: this });
          return "Invalid";
        }
        if (results.includes("NotValidated")) {
          this.emit("core.form.notvalidated", { instance: this });
          return "NotValidated";
        }
        this.emit("core.form.valid", { instance: this });
        return "Valid";
      });
  }

  validateField(field: string): Promise<ValidationStatus> {
    const cached = this.results.get(field);
    if (cached === "Valid" || cached === "Invalid") {
      return Promise.resolve(cached);
    }

    this.emit("core.field.validating", { field });
    const elements = this.elements[field];

    if (!elements || elements.length === 0) {
      this.results.set(field, "NotValidated");
      this.emit("core.field.validated", { field, result: "NotValidated", elements: [] });
      this.emit("core.field.notvalidated", { field, elements: [] });
      return Promise.resolve("NotValidated");
    }

    return Promise.all(elements.map((el) => this.validateElement(field, el))).then((results) => {
      const status: ValidationStatus = results.includes("Invalid")
        ? "Invalid"
        : results.includes("NotValidated")
          ? "NotValidated"
          : "Valid";
      this.results.set(field, status);
      this.emit("core.field.validated", { field, result: status, elements });
      if (status === "Valid") this.emit("core.field.valid", { field, elements });
      else if (status === "Invalid") this.emit("core.field.invalid", { field, elements });
      else this.emit("core.field.notvalidated", { field, elements });
      return status;
    });
  }

  private validateElement(field: string, element: HTMLElement): Promise<ValidationStatus> {
    const fieldOpts = this.fields[field];
    if (!fieldOpts) return Promise.resolve("NotValidated");

    const allValidatorNames = Object.keys(fieldOpts.validators);
    const activeValidatorNames = allValidatorNames.filter((name) => {
      const opts = fieldOpts.validators[name];
      if (opts.enabled === false) return false;
      return this.filter.execute<boolean>("field-should-validate", true, [field, name, element]);
    });

    this.emit("core.element.validating", { field, element, elements: this.elements[field] });

    if (activeValidatorNames.length === 0) {
      this.emit("core.element.ignored", { field, element, elements: this.elements[field] });
      const payload: ElementValidatedPayload = {
        field,
        element,
        elements: this.elements[field],
        valid: true,
        result: "Valid",
        validators: {},
      };
      this.emit("core.element.validated", payload);
      return Promise.resolve("Valid");
    }

    // Validators skipped by filter (e.g. Excluded, Sequence)
    const ignoredValidatorNames = allValidatorNames.filter(
      (name) => !activeValidatorNames.includes(name) && fieldOpts.validators[name].enabled !== false,
    );
    for (const name of ignoredValidatorNames) {
      this.emit("core.validator.notvalidated", { field, validator: name });
    }

    const rawValue = this.getElementValue(element);

    const promises = activeValidatorNames.map((name) => {
      const factory = this.validators[name];
      if (!factory) {
        this.emit("core.validator.notvalidated", { field, validator: name });
        return Promise.resolve({
          name,
          status: "NotValidated" as ValidationStatus,
          valid: false,
          message: "",
        });
      }

      // Allow plugins (e.g. Transformer) to transform the value per validator
      const value = this.filter.execute<string>("field-value", rawValue, [field, element, name]);

      const opts: ValidatorOptions = fieldOpts.validators[name];
      const input: ValidatorInput = {
        value,
        options: opts,
        field,
        elements: this.elements[field],
        form: this.form,
      };

      this.emit("core.validator.validating", { field, validator: name });

      return Promise.resolve(factory().validate(input)).then((result) => {
        const status: ValidationStatus = result.valid ? "Valid" : "Invalid";
        // Priority: field opts.message > validator result.message > locale > default
        const message =
          (typeof opts.message === "string" ? opts.message : undefined) ??
          result.message ??
          this.locale[name]?.default ??
          "This value is not valid";

        // Cache per-validator result for Sequence plugin
        if (!this.validatorResults.has(field)) {
          this.validatorResults.set(field, {});
        }
        const vr = this.validatorResults.get(field);
        if (vr) vr[name] = status;

        this.emit("core.validator.validated", {
          field,
          validator: name,
          result: { ...result, status, message },
        });
        return { name, status, valid: result.valid, message };
      });
    });

    return Promise.all(promises).then((results) => {
      const validatorsMap: ElementValidatedPayload["validators"] = {};
      for (const r of results) {
        validatorsMap[r.name] = { valid: r.valid, message: r.message, result: r.status };
      }

      const status: ValidationStatus = results.some((r) => r.status === "Invalid")
        ? "Invalid"
        : results.some((r) => r.status === "NotValidated")
          ? "NotValidated"
          : "Valid";

      const payload: ElementValidatedPayload = {
        field,
        element,
        elements: this.elements[field],
        valid: status === "Valid",
        result: status,
        validators: validatorsMap,
      };
      const finalPayload = this.filter.execute<ElementValidatedPayload>(
        "element-validated",
        payload,
        [],
      );
      this.emit("core.element.validated", finalPayload);
      if (status === "NotValidated") {
        this.emit("core.element.notvalidated", { field, element, elements: this.elements[field] });
      }
      return status;
    });
  }

  private getElementValue(element: HTMLElement): string {
    const el = element as HTMLInputElement;
    if (el.type === "checkbox" || el.type === "radio") {
      return el.checked ? el.value || "on" : "";
    }
    return el.value ?? "";
  }

  private queryElements(field: string): HTMLElement[] {
    const opts = this.fields[field];
    const selector = opts?.selector ?? `[name="${field}"]`;
    return Array.from(this.form.querySelectorAll<HTMLElement>(selector));
  }

  // ─── Reset / Destroy ──────────────────────────────────────────────────────

  resetField(field: string): this {
    this.results.delete(field);
    this.validatorResults.delete(field);
    this.emit("core.field.reset", { field });
    return this;
  }

  reset(): this {
    this.results.clear();
    this.validatorResults.clear();
    this.emit("core.form.reset", { instance: this });
    return this;
  }

  destroy(): void {
    for (const name of Object.keys(this.plugins)) {
      this.deregisterPlugin(name);
    }
    this.fields = {};
    this.elements = {};
    this.results.clear();
    this.validatorResults.clear();
  }
}
