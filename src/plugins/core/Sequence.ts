import { Plugin } from "../../core/Plugin";
import type { ValidationStatus } from "../../core/types";

export interface SequenceOptions {
  enabled?: boolean;
  [key: string]: unknown;
}

export class Sequence extends Plugin<SequenceOptions> {
  /** Snapshot of validator results from the previous complete run */
  private previousResults = new Map<string, Record<string, ValidationStatus>>();

  constructor(opts?: SequenceOptions) {
    super({ enabled: true, ...opts });
  }

  private onValidatorValidated = (payload: unknown): void => {
    const { field, validator, result } = payload as {
      field: string;
      validator: string;
      result: { status: ValidationStatus };
    };
    if (!this.previousResults.has(field)) {
      this.previousResults.set(field, {});
    }
    const pr = this.previousResults.get(field);
    if (pr) pr[validator] = result.status;
  };

  private shouldValidate = (defaultValue: unknown, field: unknown, validator: unknown): boolean => {
    if (!this.opts.enabled) return defaultValue as boolean;

    const fieldName = field as string;
    const validatorName = validator as string;
    const fieldOpts = this.core.getFields()[fieldName];
    if (!fieldOpts) return defaultValue as boolean;

    const validatorNames = Object.keys(fieldOpts.validators);
    const currentIndex = validatorNames.indexOf(validatorName);
    if (currentIndex === 0) return defaultValue as boolean;

    // Check if any previous validator failed in the last completed run
    const prevRun = this.previousResults.get(fieldName) ?? {};
    for (const prev of validatorNames.slice(0, currentIndex)) {
      const opts = fieldOpts.validators[prev];
      if (opts.enabled === false) continue;
      if (prevRun[prev] === "Invalid") return false;
    }

    return defaultValue as boolean;
  };

  install(): void {
    this.core.on("core.validator.validated", this.onValidatorValidated);
    this.core.registerFilter("field-should-validate", this.shouldValidate);
  }

  uninstall(): void {
    this.core.off("core.validator.validated", this.onValidatorValidated);
    this.core.deregisterFilter("field-should-validate", this.shouldValidate);
  }
}
