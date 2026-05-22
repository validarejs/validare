import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload } from "../../core/types";

export interface Bootstrap5Options {
  validClass?: string;
  invalidClass?: string;
  [key: string]: unknown;
}

export class Bootstrap5 extends Plugin<Bootstrap5Options> {
  private trackedElements = new Set<HTMLElement>();

  constructor(opts?: Bootstrap5Options) {
    super({ validClass: "is-valid", invalidClass: "is-invalid", ...opts });
  }

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid } = payload as ElementValidatedPayload;
    const validClass = this.opts.validClass ?? "is-valid";
    const invalidClass = this.opts.invalidClass ?? "is-invalid";

    element.classList.toggle(validClass, valid);
    element.classList.toggle(invalidClass, !valid);
    this.trackedElements.add(element);
  };

  install(): void {
    this.core.on("core.element.validated", this.onElementValidated);
  }

  uninstall(): void {
    this.core.off("core.element.validated", this.onElementValidated);
    const validClass = this.opts.validClass ?? "is-valid";
    const invalidClass = this.opts.invalidClass ?? "is-invalid";
    for (const el of this.trackedElements) {
      el.classList.remove(validClass, invalidClass);
    }
    this.trackedElements.clear();
  }
}
