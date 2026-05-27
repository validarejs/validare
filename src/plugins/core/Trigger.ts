import { Plugin } from "../../core/Plugin";

export interface TriggerOptions {
  /** DOM event name or map of field→event. Use false to disable for a field. */
  event?: string | Record<string, string | false>;
  /** Debounce delay in milliseconds */
  delay?: number;
  [key: string]: unknown;
}

interface Handler {
  element: HTMLElement;
  event: string;
  listener: EventListener;
}

export class Trigger extends Plugin<TriggerOptions> {
  private handlers: Handler[] = [];
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(opts?: TriggerOptions) {
    super({ event: "input", delay: 0, ...opts });
  }

  private onFieldAdded = (payload: unknown): void => {
    const { field, elements } = payload as { field: string; elements: HTMLElement[] };
    this.attachToElements(field, elements);
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { elements } = payload as { elements: HTMLElement[] };
    this.detachFromElements(elements);
  };

  private getEventForField(field: string): string | false {
    const { event } = this.opts;
    if (!event) return "input";
    if (typeof event === "string") return event;
    return event[field] ?? "input";
  }

  private attachToElements(field: string, elements: HTMLElement[]): void {
    const eventName = this.getEventForField(field);
    if (eventName === false) return;

    for (const el of elements) {
      const listener: EventListener = () => {
        if (!this.isEnabled()) return;
        const delay = this.opts.delay ?? 0;
        if (delay > 0) {
          clearTimeout(this.timers.get(field));
          this.timers.set(
            field,
            setTimeout(() => {
              this.core.resetField(field);
              this.core.validateField(field);
            }, delay),
          );
        } else {
          this.core.resetField(field);
          void this.core.validateField(field);
        }
      };
      el.addEventListener(eventName, listener);
      this.handlers.push({ element: el, event: eventName, listener });
    }
  }

  private detachFromElements(elements: HTMLElement[]): void {
    this.handlers = this.handlers.filter(({ element, event, listener }) => {
      if (elements.includes(element)) {
        element.removeEventListener(event, listener);
        return false;
      }
      return true;
    });
  }

  install(): void {
    this.core.on("core.field.added", this.onFieldAdded);
    this.core.on("core.field.removed", this.onFieldRemoved);

    // Attach to fields already present when the plugin is registered
    for (const field of Object.keys(this.core.getFields())) {
      this.attachToElements(field, this.core.getElements(field));
    }
  }

  uninstall(): void {
    this.core.off("core.field.added", this.onFieldAdded);
    this.core.off("core.field.removed", this.onFieldRemoved);
    for (const { element, event, listener } of this.handlers) {
      element.removeEventListener(event, listener);
    }
    this.handlers = [];
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }
}
