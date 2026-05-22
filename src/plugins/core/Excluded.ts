import { Plugin } from "../../core/Plugin";

type ExcludedFn = (field: string, element: HTMLElement) => boolean;

export interface ExcludedOptions {
  excluded?: string | ExcludedFn;
  [key: string]: unknown;
}

export class Excluded extends Plugin<ExcludedOptions> {
  private isExcluded = (
    defaultValue: unknown,
    field: unknown,
    _validator: unknown,
    element: unknown,
  ): boolean => {
    if (!this.isEnabled()) return defaultValue as boolean;
    const el = element as HTMLElement;
    const fieldName = field as string;
    const { excluded } = this.opts;

    // Default: exclude disabled and hidden inputs
    const input = el as HTMLInputElement;
    if (input.disabled || input.type === "hidden") return false;

    if (!excluded) return defaultValue as boolean;

    if (typeof excluded === "function") {
      return excluded(fieldName, el) ? false : (defaultValue as boolean);
    }

    if (typeof excluded === "string") {
      return el.matches(excluded) ? false : (defaultValue as boolean);
    }

    return defaultValue as boolean;
  };

  install(): void {
    this.core.registerFilter("field-should-validate", this.isExcluded);
  }

  uninstall(): void {
    this.core.deregisterFilter("field-should-validate", this.isExcluded);
  }
}
