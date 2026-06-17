import { Plugin } from "../../core/Plugin";

export interface CharCounterOptions {
  enabled?: boolean;
  /** CSS selector for the counter container. Defaults to ".vd-plugins-char-counter" within the field's parent. */
  container?: string;
  /** Function to format the counter text. Defaults to "current / max". */
  renderCount?: (current: number, max: number) => string;
  /** CSS class added to the container when the character count exceeds max. */
  exceededClass?: string;
  /** Only apply the counter to these field names. Defaults to all fields with a stringLength max. */
  fields?: string[];
  [key: string]: unknown;
}

interface CounterState {
  container: HTMLElement;
  max: number;
  listener: EventListener;
}

export class CharCounter extends Plugin<CharCounterOptions> {
  private counters = new Map<HTMLElement, CounterState>();

  constructor(opts?: CharCounterOptions) {
    super(opts);
    if (opts?.enabled === false) this.disable();
  }

  private renderCount(current: number, max: number): string {
    return this.opts.renderCount ? this.opts.renderCount(current, max) : `${current} / ${max}`;
  }

  private getMax(field: string): number | null {
    const validators = this.core.getFields()[field]?.validators ?? {};
    const sl = validators.stringLength as { max?: number } | undefined;
    return sl?.max ?? null;
  }

  private shouldTrack(field: string): boolean {
    if (this.opts.fields && !this.opts.fields.includes(field)) return false;
    return this.getMax(field) !== null;
  }

  private attachToField(field: string, elements: HTMLElement[]): void {
    if (!this.shouldTrack(field)) return;
    const max = this.getMax(field)!;

    for (const el of elements) {
      // Find the counter container
      const containerSelector = this.opts.container ?? ".vd-plugins-char-counter";
      const container = (el.closest("div, fieldset, li") ?? el.parentNode)?.querySelector<HTMLElement>(
        containerSelector,
      );
      if (!container) continue;

      // Set initial count
      const input = el as HTMLInputElement;
      container.textContent = this.renderCount(input.value?.length ?? 0, max);

      const listener: EventListener = () => {
        if (!this.isEnabled()) return;
        const current = (el as HTMLInputElement).value?.length ?? 0;
        container.textContent = this.renderCount(current, max);
        const exceededClass = this.opts.exceededClass ?? "vd-plugins-char-counter--exceeded";
        if (current > max) {
          container.classList.add(exceededClass);
        } else {
          container.classList.remove(exceededClass);
        }
      };

      el.addEventListener("input", listener);
      this.counters.set(el, { container, max, listener });
    }
  }

  private detachFromField(elements: HTMLElement[]): void {
    for (const el of elements) {
      const state = this.counters.get(el);
      if (state) {
        el.removeEventListener("input", state.listener);
        state.container.textContent = "";
        this.counters.delete(el);
      }
    }
  }

  private onFieldAdded = (payload: unknown): void => {
    const { field, elements } = payload as { field: string; elements: HTMLElement[] };
    this.attachToField(field, elements);
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { elements } = payload as { elements: HTMLElement[] };
    this.detachFromField(elements);
  };

  install(): void {
    this.core.on("core.field.added", this.onFieldAdded);
    this.core.on("core.field.removed", this.onFieldRemoved);

    // Seed fields already registered before install
    for (const [field, elements] of Object.entries(this.core.getFields()).map(([f]) => [
      f,
      this.core.getElements(f),
    ] as [string, HTMLElement[]])) {
      this.attachToField(field, elements);
    }
  }

  uninstall(): void {
    this.core.off("core.field.added", this.onFieldAdded);
    this.core.off("core.field.removed", this.onFieldRemoved);
    for (const [el, state] of this.counters) {
      el.removeEventListener("input", state.listener);
      state.container.textContent = "";
    }
    this.counters.clear();
  }
}
