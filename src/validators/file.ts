import type { ValidatorFactory } from "../core/types";

export const file: ValidatorFactory = () => ({
  validate(input) {
    const opts = input.options as {
      extension?: string;
      maxSize?: number;
      minFiles?: number;
      maxFiles?: number;
    };
    const el = input.elements[0] as HTMLInputElement;
    if (!el?.files || el.files.length === 0) return { valid: true };

    const files = Array.from(el.files);

    if (opts.minFiles !== undefined && files.length < opts.minFiles) return { valid: false };
    if (opts.maxFiles !== undefined && files.length > opts.maxFiles) return { valid: false };

    if (opts.extension) {
      const allowed = opts.extension.split(",").map((e) => e.trim().toLowerCase());
      for (const f of files) {
        const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
        if (!allowed.includes(ext)) return { valid: false };
      }
    }

    if (opts.maxSize !== undefined) {
      for (const f of files) {
        if (f.size > opts.maxSize) return { valid: false };
      }
    }

    return { valid: true };
  },
});
