import { Plugin } from "../../core/Plugin";
import type { FieldOptions, ValidatorOptions } from "../../core/types";

export interface DeclarativeOptions {
  /** Attribute prefix for validators. Default: "data-fv-" */
  prefix?: string;
  /** Map HTML5 attributes (required, type, minlength, etc.) to validators. Default: false */
  html5Input?: boolean;
  [key: string]: unknown;
}

export class Declarative extends Plugin<DeclarativeOptions> {
  /** Fields whose declarative attrs have already been processed — prevents infinite loops */
  private addedFields = new Set<string>();

  constructor(opts?: DeclarativeOptions) {
    super({ prefix: "data-fv-", html5Input: false, ...opts });
    if (opts?.enabled === false) this.disable();
  }

  install(): void {
    const existingFields = this.core.getFields();
    const parsed = this.parseAllElements();

    for (const [field, { validators, selector }] of Object.entries(parsed)) {
      // Normalize: any validator with no explicit `enabled` defaults to false
      for (const v of Object.keys(validators)) {
        if (validators[v].enabled === undefined) {
          validators[v].enabled = false;
        }
      }

      const existing = existingFields[field];
      if (existing) {
        // Field already defined programmatically — only add validators NOT already there
        const extra: Record<string, ValidatorOptions> = {};
        for (const [v, vopts] of Object.entries(validators)) {
          if (!existing.validators[v]) extra[v] = vopts;
        }
        if (Object.keys(extra).length > 0) {
          this.addedFields.add(field);
          this.core.addField(field, { validators: extra });
        }
      } else {
        // Purely declarative field — add it fresh
        this.addedFields.add(field);
        const fieldOpts: FieldOptions = { validators };
        if (selector) fieldOpts.selector = selector;
        this.core.addField(field, fieldOpts);
      }
    }

    this.core.on("core.field.added", this.onFieldAdded);
    this.core.on("core.field.removed", this.onFieldRemoved);
  }

  uninstall(): void {
    this.addedFields.clear();
    this.core.off("core.field.added", this.onFieldAdded);
    this.core.off("core.field.removed", this.onFieldRemoved);
  }

  private onFieldAdded = (payload: unknown): void => {
    const { field, elements, options } = payload as {
      field: string;
      elements: HTMLElement[];
      options: FieldOptions;
    };
    if (!elements || elements.length === 0 || this.addedFields.has(field)) return;
    this.addedFields.add(field);

    const allDeclarative: Record<string, ValidatorOptions> = {};
    for (const el of elements) {
      const { validators } = this.parseElement(el);
      Object.assign(allDeclarative, validators);
    }
    if (Object.keys(allDeclarative).length === 0) return;

    // Normalize enabled flag
    for (const v of Object.keys(allDeclarative)) {
      if (allDeclarative[v].enabled === undefined) allDeclarative[v].enabled = false;
    }

    // Only add validators not already in the programmatic config
    const extra: Record<string, ValidatorOptions> = {};
    for (const [v, vopts] of Object.entries(allDeclarative)) {
      if (!options.validators[v]) extra[v] = vopts;
    }
    if (Object.keys(extra).length > 0) {
      this.core.addField(field, { validators: extra });
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.addedFields.delete(field);
  };

  /** Scan form for all elements with [name] or [prefix+field], parse each one. */
  private parseAllElements(): Record<string, { validators: Record<string, ValidatorOptions>; selector?: string }> {
    const prefix = this.opts.prefix as string;
    const result: Record<string, { validators: Record<string, ValidatorOptions>; selector?: string }> = {};
    const elements = Array.from(
      this.core.form.querySelectorAll<HTMLElement>(`[name], [${prefix}field]`),
    );
    for (const el of elements) {
      const { validators } = this.parseElement(el);
      if (Object.keys(validators).length === 0) continue;
      const name = el.getAttribute("name");
      const fvField = el.getAttribute(`${prefix}field`);
      const field = name ?? fvField ?? "";
      if (!field) continue;
      // If element has no name attribute, we need a custom selector to find it
      const selector = !name && fvField ? `[${prefix}field="${fvField}"]` : undefined;
      if (result[field]) {
        result[field].validators = { ...result[field].validators, ...validators };
      } else {
        result[field] = { validators: { ...validators }, selector };
      }
    }
    return result;
  }

  /** Parse data-fv-* attributes (and html5 attrs if enabled) from a single element. */
  parseElement(el: HTMLElement): { validators: Record<string, ValidatorOptions> } {
    const prefix = this.opts.prefix as string;
    const html5Input = this.opts.html5Input as boolean;
    // Escape any regex metacharacters in the prefix (e.g. the hyphens in "data-fv-")
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(`^${escapedPrefix}([a-z0-9-]+)(___)?([a-z0-9-]+)?$`);
    const opts: Record<string, Record<string, unknown>> = {};
    const type = el.getAttribute("type");

    // ── HTML5 attribute mappings ────────────────────────────────────────────
    if (html5Input) {
      if (el.hasAttribute("required")) {
        opts.notEmpty = { ...opts.notEmpty, enabled: true };
      }
      if (type === "email") {
        opts.email = { ...opts.email, enabled: true };
      }
      if (type === "url") {
        opts.uri = { ...opts.uri, enabled: true };
      }
      if (type === "range") {
        const min = el.getAttribute("min");
        const max = el.getAttribute("max");
        opts.between = {
          ...opts.between,
          enabled: true,
          ...(min !== null ? { min: parseFloat(min) } : {}),
          ...(max !== null ? { max: parseFloat(max) } : {}),
        };
      }
      const minlength = el.getAttribute("minlength");
      if (minlength !== null) {
        opts.stringLength = { ...opts.stringLength, enabled: true, min: parseInt(minlength, 10) };
      }
      const maxlength = el.getAttribute("maxlength");
      if (maxlength !== null) {
        opts.stringLength = { ...opts.stringLength, enabled: true, max: parseInt(maxlength, 10) };
      }
      const pattern = el.getAttribute("pattern");
      if (pattern !== null) {
        opts.regexp = { ...opts.regexp, enabled: true, regexp: pattern };
      }
      const minVal = el.getAttribute("min");
      if (minVal !== null && type !== "date" && type !== "range") {
        opts.greaterThan = { ...opts.greaterThan, enabled: true, min: parseFloat(minVal) };
      }
      const maxVal = el.getAttribute("max");
      if (maxVal !== null && type !== "date" && type !== "range") {
        opts.lessThan = { ...opts.lessThan, enabled: true, max: parseFloat(maxVal) };
      }
    }

    // ── data-fv-* attribute parsing ─────────────────────────────────────────
    for (const attr of Array.from(el.attributes)) {
      const match = reg.exec(attr.name);
      if (!match) continue;
      const validatorName = this.toCamelCase(match[1]);
      // Skip data-fv-field — it names the field, it's not a validator
      if (validatorName === "field") continue;
      const optionName = match[3] ? this.toCamelCase(match[3]) : null;
      if (!opts[validatorName]) opts[validatorName] = {};
      if (optionName) {
        opts[validatorName][optionName] = this.normalizeValue(attr.value);
      } else {
        // Base attribute: data-fv-{validator} — sets enabled flag
        if (opts[validatorName].enabled !== true) {
          opts[validatorName].enabled = attr.value === "" || attr.value === "true";
        }
      }
    }

    return { validators: opts as Record<string, ValidatorOptions> };
  }

  /** Coerce attribute string values to their natural types. */
  private normalizeValue(value: string): boolean | number | string {
    if (value === "true" || value === "") return true;
    if (value === "false") return false;
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== "") return num;
    return value;
  }

  private toCamelCase(input: string): string {
    return input.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  }
}
