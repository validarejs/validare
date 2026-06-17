import { Plugin } from "../../core/Plugin";
import type { ElementValidatedPayload } from "../../core/types";

export interface SummaryOptions {
  enabled?: boolean;
  /** CSS selector for the summary container element. Default: ".vd-plugins-summary" */
  container?: string;
  /** Renders the title line. Return empty string to omit. */
  renderTitle?: () => string;
  /** Renders a single error item. Receives field name and message. */
  renderItem?: (field: string, message: string) => string;
  /** Scroll the container into view after rendering. Default: false */
  autoScroll?: boolean;
  [key: string]: unknown;
}

export class Summary extends Plugin<SummaryOptions> {
  /** Last known error messages: field → message[] */
  private messages = new Map<string, string[]>();

  constructor(opts?: SummaryOptions) {
    super(opts);
    if (opts?.enabled === false) this.disable();
  }

  private getContainer(): HTMLElement | null {
    const selector = this.opts.container ?? ".vd-plugins-summary";
    return document.querySelector<HTMLElement>(selector);
  }

  private onElementValidated = (payload: unknown): void => {
    const { field, validators } = payload as ElementValidatedPayload;
    const errors = Object.values(validators)
      .filter((r) => !r.valid && r.message)
      .map((r) => r.message);
    if (errors.length > 0) {
      this.messages.set(field, errors);
    } else {
      this.messages.delete(field);
    }
  };

  private onFormInvalid = (): void => {
    if (!this.isEnabled()) return;
    const container = this.getContainer();
    if (!container) return;

    const renderItem = this.opts.renderItem ?? ((_field, msg) => msg);
    const renderTitle =
      this.opts.renderTitle ?? (() => "Please fix the following errors:");

    const allErrors: Array<{ field: string; message: string }> = [];
    for (const [field, msgs] of this.messages) {
      for (const msg of msgs) {
        allErrors.push({ field, message: msg });
      }
    }

    if (allErrors.length === 0) {
      container.innerHTML = "";
      return;
    }

    const title = renderTitle();
    const items = allErrors
      .map(({ field, message }) => `<li>${renderItem(field, message)}</li>`)
      .join("");

    container.innerHTML = `${title ? `<p>${title}</p>` : ""}<ul>${items}</ul>`;

    if (this.opts.autoScroll) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  private onFormClear = (): void => {
    this.messages.clear();
    const container = this.getContainer();
    if (container) container.innerHTML = "";
  };

  install(): void {
    this.core.on("core.element.validated", this.onElementValidated);
    this.core.on("core.form.invalid", this.onFormInvalid);
    this.core.on("core.form.valid", this.onFormClear);
    this.core.on("core.form.reset", this.onFormClear);
  }

  uninstall(): void {
    this.core.off("core.element.validated", this.onElementValidated);
    this.core.off("core.form.invalid", this.onFormInvalid);
    this.core.off("core.form.valid", this.onFormClear);
    this.core.off("core.form.reset", this.onFormClear);
    this.onFormClear();
  }
}
