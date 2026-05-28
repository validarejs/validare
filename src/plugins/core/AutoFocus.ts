import { Plugin } from "../../core/Plugin";
import type { ValidationStatus } from "../../core/types";

export interface AutoFocusOptions {
  /** Called before focusing the first invalid element. */
  onPrefocus?: (payload: { field: string; element: HTMLElement }) => void;
  [key: string]: unknown;
}

export class AutoFocus extends Plugin<AutoFocusOptions> {
  private fieldStatuses = new Map<string, ValidationStatus>();

  constructor(opts?: Partial<AutoFocusOptions>) {
    super(opts);
    if (opts?.enabled === false) {
      this.disable();
    }
  }

  private onFieldValidated = (payload: unknown): void => {
    const { field, result } = payload as { field: string; result: ValidationStatus };
    this.fieldStatuses.set(field, result);
  };

  private onFormInvalid = (): void => {
    if (!this.isEnabled()) return;

    const fields = this.core.getFields();
    for (const field of Object.keys(fields)) {
      if (this.fieldStatuses.get(field) === "Invalid") {
        const elements = this.core.getElements(field);
        const firstElement = elements[0];
        if (!firstElement) continue;

        if (this.opts.onPrefocus) {
          this.opts.onPrefocus({ field, element: firstElement });
        }

        firstElement.focus();
        return;
      }
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { field } = payload as { field: string };
    this.fieldStatuses.delete(field);
  };

  private onFormValidating = (): void => {
    this.fieldStatuses.clear();
  };

  private onFormReset = (): void => {
    this.fieldStatuses.clear();
  };

  install(): void {
    this.core.on("core.form.validating", this.onFormValidating);
    this.core.on("core.field.validated", this.onFieldValidated);
    this.core.on("core.form.invalid", this.onFormInvalid);
    this.core.on("core.field.removed", this.onFieldRemoved);
    this.core.on("core.form.reset", this.onFormReset);
  }

  uninstall(): void {
    this.core.off("core.form.validating", this.onFormValidating);
    this.core.off("core.field.validated", this.onFieldValidated);
    this.core.off("core.form.invalid", this.onFormInvalid);
    this.core.off("core.field.removed", this.onFieldRemoved);
    this.core.off("core.form.reset", this.onFormReset);
    this.fieldStatuses.clear();
  }
}
