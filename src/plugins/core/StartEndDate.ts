import { Plugin } from "../../core/Plugin";
import type { ValidatorInput } from "../../core/types";

export interface StartEndDateOptions {
  /** Date format string. Supported tokens: YYYY, MM, DD. Separator: `-` or `/`. */
  format: string;
  startDate: {
    /** Name of the start date field */
    field: string;
    /** Error message shown on the start date field when start > end */
    message: string;
  };
  endDate: {
    /** Name of the end date field */
    field: string;
    /** Error message shown on the end date field when end < start */
    message: string;
  };
}

/** Parse a date string according to a format string. Returns NaN on failure. */
function parseDate(value: string, format: string): number {
  const sep = /[-/]/.exec(format)?.[0] ?? "-";
  const fParts = format.split(sep);
  const vParts = value.split(sep);
  if (vParts.length !== 3) return NaN;
  const yIdx = fParts.indexOf("YYYY");
  const mIdx = fParts.indexOf("MM");
  const dIdx = fParts.indexOf("DD");
  if (yIdx < 0 || mIdx < 0 || dIdx < 0) return NaN;
  return Date.UTC(
    parseInt(vParts[yIdx], 10),
    parseInt(vParts[mIdx], 10) - 1,
    parseInt(vParts[dIdx], 10),
  );
}

export class StartEndDate extends Plugin<StartEndDateOptions> {
  private readonly _id = Math.random().toString(36).slice(2, 8);

  /** Validator key added to the start date field */
  private get startKey(): string {
    return `__startEndDate_s_${this._id}_${this.opts.startDate.field}`;
  }
  /** Validator key added to the end date field */
  private get endKey(): string {
    return `__startEndDate_e_${this._id}_${this.opts.endDate.field}`;
  }

  /** Prevent recursive cross-revalidation */
  private revalidating = new Set<string>();

  private onFieldValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { field } = payload as { field: string; result: string };
    // If this field was triggered by a cross-revalidation from this plugin, stop here
    if (this.revalidating.has(field)) return;

    if (field === this.opts.startDate.field && !this.revalidating.has(this.opts.endDate.field)) {
      this.revalidating.add(this.opts.endDate.field);
      this.core.resetField(this.opts.endDate.field);
      void this.core.validateField(this.opts.endDate.field).finally(() => {
        this.revalidating.delete(this.opts.endDate.field);
      });
    } else if (field === this.opts.endDate.field && !this.revalidating.has(this.opts.startDate.field)) {
      this.revalidating.add(this.opts.startDate.field);
      this.core.resetField(this.opts.startDate.field);
      void this.core.validateField(this.opts.startDate.field).finally(() => {
        this.revalidating.delete(this.opts.startDate.field);
      });
    }
  };

  install(): void {
    const { format, startDate, endDate } = this.opts;
    const form = this.core.form;

    // Register validator factories for cross-field comparison
    this.core.registerValidator(this.startKey, () => ({
      validate: (input: ValidatorInput) => {
        const endEl = form.querySelector<HTMLInputElement>(`[name="${endDate.field}"]`);
        if (!endEl?.value) return { valid: true };
        const start = parseDate(input.value, format);
        const end = parseDate(endEl.value, format);
        if (isNaN(start) || isNaN(end)) return { valid: true };
        return { valid: start <= end };
      },
    }));

    this.core.registerValidator(this.endKey, () => ({
      validate: (input: ValidatorInput) => {
        const startEl = form.querySelector<HTMLInputElement>(`[name="${startDate.field}"]`);
        if (!startEl?.value) return { valid: true };
        const start = parseDate(startEl.value, format);
        const end = parseDate(input.value, format);
        if (isNaN(start) || isNaN(end)) return { valid: true };
        return { valid: start <= end };
      },
    }));

    // Merge cross-field validators into both fields
    this.core.addField(startDate.field, {
      validators: { [this.startKey]: { message: startDate.message } },
    });
    this.core.addField(endDate.field, {
      validators: { [this.endKey]: { message: endDate.message } },
    });

    this.core.on("core.field.validated", this.onFieldValidated);
  }

  uninstall(): void {
    this.core.off("core.field.validated", this.onFieldValidated);
    this.core.removeValidator(this.opts.startDate.field, this.startKey);
    this.core.removeValidator(this.opts.endDate.field, this.endKey);
    this.core.deregisterValidator(this.startKey);
    this.core.deregisterValidator(this.endKey);
    this.revalidating.clear();
  }
}
