import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload } from "../../core/types";

export interface IconOptions {
  valid?: string;
  invalid?: string;
  validating?: string;
  [key: string]: unknown;
}

export class Icon extends Plugin<IconOptions> {
  private icons = new Map<HTMLElement, HTMLElement>();

  constructor(opts?: IconOptions) {
    super({ valid: "✓", invalid: "✗", validating: "…", ...opts });
  }

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid } = payload as ElementValidatedPayload;

    let icon = this.icons.get(element);
    if (!icon) {
      icon = document.createElement("span");
      icon.className = "vd-plugins-icon";
      element.parentNode?.insertBefore(icon, element.nextSibling);
      this.icons.set(element, icon);
    }

    icon.classList.remove("vd-plugins-icon--valid", "vd-plugins-icon--invalid");
    if (valid) {
      icon.classList.add("vd-plugins-icon--valid");
      icon.textContent = this.opts.valid ?? "✓";
    } else {
      icon.classList.add("vd-plugins-icon--invalid");
      icon.textContent = this.opts.invalid ?? "✗";
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { elements } = payload as { elements: HTMLElement[] };
    for (const el of elements) {
      const icon = this.icons.get(el);
      if (icon) {
        icon.parentNode?.removeChild(icon);
        this.icons.delete(el);
      }
    }
  };

  install(): void {
    this.core.on("core.element.validated", this.onElementValidated);
    this.core.on("core.field.removed", this.onFieldRemoved);
  }

  uninstall(): void {
    this.core.off("core.element.validated", this.onElementValidated);
    this.core.off("core.field.removed", this.onFieldRemoved);
    for (const icon of this.icons.values()) {
      icon.parentNode?.removeChild(icon);
    }
    this.icons.clear();
  }
}
