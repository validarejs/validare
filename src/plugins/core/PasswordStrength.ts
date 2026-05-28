import { Plugin } from "../../core/Plugin";
import type { ValidatorFactory, ValidatorInput } from "../../core/types";

export interface PasswordStrengthOptions {
  /** The field name to evaluate password strength for */
  field: string;
  /** Error message when score is below minScore. Default: 'The password is not strong enough' */
  message?: string;
  /** Minimum required score (0–4). Default: 3 */
  minScore?: number;
  /** Called after each evaluation */
  onScore?: (payload: { field: string; score: number; valid: boolean }) => void;
  [key: string]: unknown;
}

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export class PasswordStrength extends Plugin<PasswordStrengthOptions> {
  private readonly _id = Math.random().toString(36).slice(2, 8);
  private get validatorName(): string {
    return `__pwStr_${this._id}`;
  }

  private buildFactory(): ValidatorFactory {
    const field = this.opts.field;
    const minScore = this.opts.minScore ?? 3;
    const message = this.opts.message ?? "The password is not strong enough";
    const onScore = this.opts.onScore;

    return () => ({
      validate(input: ValidatorInput) {
        const score = scorePassword(input.value);
        const valid = score >= minScore;
        if (onScore) {
          onScore({ field, score, valid });
        }
        return { valid, message: valid ? "" : message };
      },
    });
  }

  install(): void {
    this.core.registerValidator(this.validatorName, this.buildFactory());
    this.core.addField(this.opts.field, {
      validators: {
        [this.validatorName]: {},
      },
    });
  }

  uninstall(): void {
    this.core.removeValidator(this.opts.field, this.validatorName);
    this.core.deregisterValidator(this.validatorName);
  }
}
