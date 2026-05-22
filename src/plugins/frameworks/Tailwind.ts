import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload } from "../../core/types";

export interface TailwindOptions {
  /** Space-separated Tailwind classes for valid state */
  validClass?: string;
  /** Space-separated Tailwind classes for invalid state */
  invalidClass?: string;
  [key: string]: unknown;
}

export class Tailwind extends Plugin<TailwindOptions> {
  private trackedElements = new Set<HTMLElement>();

  private applyClasses(element: HTMLElement, valid: boolean): void {
    const validClasses = (this.opts.validClass ?? "").split(" ").filter(Boolean);
    const invalidClasses = (this.opts.invalidClass ?? "").split(" ").filter(Boolean);
    if (valid) {
      element.classList.add(...validClasses);
      element.classList.remove(...invalidClasses);
    } else {
      element.classList.add(...invalidClasses);
      element.classList.remove(...validClasses);
    }
    this.trackedElements.add(element);
  }

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid } = payload as ElementValidatedPayload;
    this.applyClasses(element, valid);
  };

  install(): void {
    this.core.on("core.element.validated", this.onElementValidated);
  }

  uninstall(): void {
    this.core.off("core.element.validated", this.onElementValidated);
    const validClasses = (this.opts.validClass ?? "").split(" ").filter(Boolean);
    const invalidClasses = (this.opts.invalidClass ?? "").split(" ").filter(Boolean);
    for (const el of this.trackedElements) {
      el.classList.remove(...validClasses, ...invalidClasses);
    }
    this.trackedElements.clear();
  }
}
