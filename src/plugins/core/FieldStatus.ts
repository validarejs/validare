import { Plugin } from "../../core/Plugin";
import type { ValidationStatus } from "../../core/types";

export type FieldValidationStatus = ValidationStatus | "Validating";

export interface FieldStatusOptions {
  onStatusChanged?: (areFieldsValid: boolean) => void;
  [key: string]: unknown;
}

export class FieldStatus extends Plugin<FieldStatusOptions> {
  private statuses = new Map<string, FieldValidationStatus>();

  constructor(opts?: FieldStatusOptions) {
    super(opts);
    if (opts?.enabled === false) this.disable();
  }

  private onFieldAdded = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.statuses.set(field, "NotValidated");
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.statuses.delete(field);
    this.notifyStatusChanged();
  };

  private onFieldValidating = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.statuses.set(field, "Validating");
    this.notifyStatusChanged();
  };

  private onFieldValidated = (payload: unknown): void => {
    const { field, result } = payload as { field: string; result: ValidationStatus };
    this.statuses.set(field, result);
    this.notifyStatusChanged();
  };

  private onFormReset = (): void => {
    for (const field of this.statuses.keys()) {
      this.statuses.set(field, "NotValidated");
    }
    this.notifyStatusChanged();
  };

  private notifyStatusChanged(): void {
    if (!this.isEnabled()) return;
    this.opts.onStatusChanged?.(this.areFieldsValid());
  }

  areFieldsValid(): boolean {
    return Array.from(this.statuses.values()).every(
      (s) => s === "Valid" || s === "NotValidated",
    );
  }

  getStatuses(): Map<string, FieldValidationStatus> {
    return this.isEnabled() ? this.statuses : new Map();
  }

  install(): void {
    // Seed statuses for fields that were added before this plugin was installed
    for (const field of Object.keys(this.core.getFields())) {
      this.statuses.set(field, "NotValidated");
    }
    this.core.on("core.field.added", this.onFieldAdded);
    this.core.on("core.field.removed", this.onFieldRemoved);
    this.core.on("core.field.validating", this.onFieldValidating);
    this.core.on("core.field.validated", this.onFieldValidated);
    this.core.on("core.form.reset", this.onFormReset);
  }

  uninstall(): void {
    this.core.off("core.field.added", this.onFieldAdded);
    this.core.off("core.field.removed", this.onFieldRemoved);
    this.core.off("core.field.validating", this.onFieldValidating);
    this.core.off("core.field.validated", this.onFieldValidated);
    this.core.off("core.form.reset", this.onFormReset);
    this.statuses.clear();
  }
}
