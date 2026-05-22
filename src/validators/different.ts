import type { ValidatorFactory } from "../core/types";

export const different: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as { compare: string; trim?: boolean };
    const compareEl = input.form.querySelector<HTMLInputElement>(`[name="${opts.compare}"]`);
    if (!compareEl) return { valid: true };
    const a = opts.trim ? input.value.trim() : input.value;
    const b = opts.trim ? compareEl.value.trim() : compareEl.value;
    return { valid: a !== b };
  },
});
