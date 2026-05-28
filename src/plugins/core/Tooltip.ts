import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload } from "../../core/types";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipTrigger = "hover" | "click";

export interface TooltipOptions {
  /** Where the tooltip appears relative to the field element. Default: 'top' */
  placement?: TooltipPlacement;
  /** What triggers the tooltip. Default: 'hover' */
  trigger?: TooltipTrigger;
  [key: string]: unknown;
}

export class Tooltip extends Plugin<TooltipOptions> {
  private tip: HTMLElement | null = null;
  private messages = new Map<HTMLElement, string>();
  private currentElement: HTMLElement | null = null;
  private triggerListeners = new Map<
    HTMLElement,
    { show: (e: MouseEvent) => void; hide?: () => void }
  >();

  constructor(opts?: TooltipOptions) {
    super({ placement: "top", trigger: "hover", ...opts });
    if (opts?.enabled === false) this.disable();
  }

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid, validators } = payload as ElementValidatedPayload;

    if (!valid) {
      const firstFailing = Object.values(validators).find((r) => !r.valid && r.message);
      if (firstFailing) {
        this.messages.set(element, firstFailing.message);
        this.attachTrigger(element);
      }
    } else {
      if (this.currentElement === element) {
        this.hideTip();
      }
      this.messages.delete(element);
      this.detachTrigger(element);
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { elements } = payload as { elements: HTMLElement[] };
    for (const el of elements) {
      if (this.currentElement === el) this.hideTip();
      this.messages.delete(el);
      this.detachTrigger(el);
    }
  };

  private onDocumentClicked = (): void => {
    this.hideTip();
  };

  private attachTrigger(element: HTMLElement): void {
    if (this.triggerListeners.has(element)) return;
    const trigger = this.opts.trigger ?? "hover";

    if (trigger === "hover") {
      const show = () => this.showTip(element);
      const hide = () => this.hideTip();
      element.addEventListener("mouseenter", show);
      element.addEventListener("mouseleave", hide);
      this.triggerListeners.set(element, { show, hide });
    } else {
      const show = (e: MouseEvent) => {
        e.stopPropagation();
        this.showTip(element);
      };
      element.addEventListener("click", show);
      this.triggerListeners.set(element, { show });
    }
  }

  private detachTrigger(element: HTMLElement): void {
    const listeners = this.triggerListeners.get(element);
    if (!listeners) return;
    const trigger = this.opts.trigger ?? "hover";
    if (trigger === "hover") {
      element.removeEventListener("mouseenter", listeners.show);
      if (listeners.hide) element.removeEventListener("mouseleave", listeners.hide);
    } else {
      element.removeEventListener("click", listeners.show);
    }
    this.triggerListeners.delete(element);
  }

  private showTip(element: HTMLElement): void {
    const message = this.messages.get(element);
    if (!message || !this.tip) return;

    this.currentElement = element;
    this.tip.textContent = message;
    this.tip.classList.add("fv-plugins-tooltip--show");

    const rect = element.getBoundingClientRect();
    const tipRect = this.tip.getBoundingClientRect();
    const scrollTop = window.scrollY ?? 0;
    const scrollLeft = window.scrollX ?? 0;
    const placement = this.opts.placement ?? "top";

    let top = 0;
    let left = 0;
    switch (placement) {
      case "bottom":
        top = rect.bottom + scrollTop;
        left = rect.left + rect.width / 2 - tipRect.width / 2 + scrollLeft;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tipRect.height / 2 + scrollTop;
        left = rect.left - tipRect.width + scrollLeft;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tipRect.height / 2 + scrollTop;
        left = rect.right + scrollLeft;
        break;
      case "top":
      default:
        top = rect.top - tipRect.height + scrollTop;
        left = rect.left + rect.width / 2 - tipRect.width / 2 + scrollLeft;
        break;
    }
    this.tip.style.top = `${top}px`;
    this.tip.style.left = `${left}px`;
  }

  private hideTip(): void {
    this.currentElement = null;
    if (!this.tip) return;
    this.tip.classList.remove("fv-plugins-tooltip--show");
    this.tip.textContent = "";
  }

  install(): void {
    this.tip = document.createElement("div");
    this.tip.className = `fv-plugins-tooltip fv-plugins-tooltip--${this.opts.placement ?? "top"}`;
    document.body.appendChild(this.tip);

    this.core.on("core.element.validated", this.onElementValidated);
    this.core.on("core.field.removed", this.onFieldRemoved);

    if ((this.opts.trigger ?? "hover") === "click") {
      document.addEventListener("click", this.onDocumentClicked);
    }
  }

  uninstall(): void {
    this.core.off("core.element.validated", this.onElementValidated);
    this.core.off("core.field.removed", this.onFieldRemoved);

    if ((this.opts.trigger ?? "hover") === "click") {
      document.removeEventListener("click", this.onDocumentClicked);
    }

    for (const element of [...this.triggerListeners.keys()]) {
      this.detachTrigger(element);
    }

    this.messages.clear();
    this.currentElement = null;
    if (this.tip) this.tip.parentNode?.removeChild(this.tip);
  }
}
