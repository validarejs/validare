import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload, ValidationStatus } from "../../core/types";

export interface AriaOptions {
  [key: string]: unknown;
}

export class Aria extends Plugin<AriaOptions> {
  private readonly _id = Math.random().toString(36).slice(2, 8);
  private containerIds = new Map<string, string>();

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid } = payload as ElementValidatedPayload;
    element.setAttribute("aria-invalid", valid ? "false" : "true");
  };

  private onFieldValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { field, result, elements } = payload as {
      field: string;
      result: ValidationStatus;
      elements: HTMLElement[];
    };

    if (result === "Invalid") {
      let container: HTMLElement | null = null;
      for (const el of elements) {
        const sibling = el.nextElementSibling as HTMLElement | null;
        if (sibling?.classList.contains("vd-plugins-message-container")) {
          container = sibling;
          break;
        }
      }

      if (container) {
        if (!this.containerIds.has(field)) {
          this.containerIds.set(field, `fv-aria-${this._id}-${field}-messages`);
        }
        const id = this.containerIds.get(field)!;
        container.id = id;
        container.setAttribute("role", "alert");
        for (const el of elements) {
          el.setAttribute("aria-describedby", id);
        }
      }
    } else {
      // Find and clean up the message container if it exists
      let container: HTMLElement | null = null;
      for (const el of elements) {
        const sibling = el.nextElementSibling as HTMLElement | null;
        if (sibling?.classList.contains("vd-plugins-message-container")) {
          container = sibling;
          break;
        }
      }
      if (container) {
        container.removeAttribute("id");
        container.removeAttribute("role");
      }
      this.containerIds.delete(field);
      for (const el of elements) {
        el.removeAttribute("aria-describedby");
      }
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { field, elements } = payload as { field: string; elements: HTMLElement[] };
    this.containerIds.delete(field);
    for (const el of elements) {
      el.removeAttribute("aria-invalid");
      el.removeAttribute("aria-describedby");
    }
  };

  install(): void {
    this.core.on("core.element.validated", this.onElementValidated);
    this.core.on("core.field.validated", this.onFieldValidated);
    this.core.on("core.field.removed", this.onFieldRemoved);
  }

  uninstall(): void {
    this.core.off("core.element.validated", this.onElementValidated);
    this.core.off("core.field.validated", this.onFieldValidated);
    this.core.off("core.field.removed", this.onFieldRemoved);
    this.containerIds.clear();
  }
}
