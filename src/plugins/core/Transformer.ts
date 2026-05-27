import { Plugin } from "../../core/Plugin";

export interface TransformerOptions {
  /**
   * Map of field name → map of validator name → transform function.
   * The function receives (field, element, validator) and returns the transformed string value.
   */
  [field: string]: {
    [validator: string]: (
      field: string,
      element: HTMLElement,
      validator: string,
    ) => string;
  };
}

export class Transformer extends Plugin<TransformerOptions> {
  private valueFilter = (
    defaultValue: unknown,
    field: unknown,
    element: unknown,
    validator: unknown,
  ): unknown => {
    if (!this.isEnabled()) return defaultValue;
    const fn = this.opts[field as string]?.[validator as string];
    if (typeof fn !== "function") return defaultValue;
    return fn(field as string, element as HTMLElement, validator as string);
  };

  install(): void {
    this.core.registerFilter("field-value", this.valueFilter);
  }

  uninstall(): void {
    this.core.deregisterFilter("field-value", this.valueFilter);
  }
}
