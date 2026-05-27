import { Plugin } from "../../core/Plugin";

export interface DependencyOptions {
  /** Map of field name → space-separated list of dependent fields to revalidate */
  [field: string]: string;
}

export class Dependency extends Plugin<DependencyOptions> {
  /** Fields currently being revalidated by this plugin — prevents infinite loops */
  private revalidating = new Set<string>();

  private onFieldValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { field } = payload as { field: string; result: string; elements: HTMLElement[] };

    // If this field was triggered by a dependency chain, skip to prevent loops
    if (this.revalidating.has(field)) return;

    const depString = this.opts[field];
    if (!depString) return;

    const deps = depString
      .split(" ")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const dep of deps) {
      if (this.revalidating.has(dep)) continue;
      this.revalidating.add(dep);
      this.core.resetField(dep);
      void this.core.validateField(dep).finally(() => {
        this.revalidating.delete(dep);
      });
    }
  };

  install(): void {
    this.core.on("core.field.validated", this.onFieldValidated);
  }

  uninstall(): void {
    this.core.off("core.field.validated", this.onFieldValidated);
    this.revalidating.clear();
  }
}
