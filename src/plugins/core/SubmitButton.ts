import { Plugin } from "../../core/Plugin";

export interface SubmitButtonOptions {
  /** CSS selector for submit button(s). Defaults to [type="submit"]. */
  selector?: string;
  [key: string]: unknown;
}

export class SubmitButton extends Plugin<SubmitButtonOptions> {
  constructor(opts?: SubmitButtonOptions) {
    super({ selector: '[type="submit"]', ...opts });
  }

  private getButtons(): HTMLButtonElement[] {
    const selector = this.opts.selector ?? '[type="submit"]';
    return Array.from(this.core.form.querySelectorAll<HTMLButtonElement>(selector));
  }

  private onValidating = (): void => {
    if (!this.isEnabled()) return;
    for (const btn of this.getButtons()) btn.disabled = true;
  };

  private onDone = (): void => {
    if (!this.isEnabled()) return;
    for (const btn of this.getButtons()) btn.disabled = false;
  };

  install(): void {
    this.core.on("core.form.validating", this.onValidating);
    this.core.on("core.form.valid", this.onDone);
    this.core.on("core.form.invalid", this.onDone);
    this.core.on("core.form.notvalidated", this.onDone);
  }

  uninstall(): void {
    this.core.off("core.form.validating", this.onValidating);
    this.core.off("core.form.valid", this.onDone);
    this.core.off("core.form.invalid", this.onDone);
    this.core.off("core.form.notvalidated", this.onDone);
    // Re-enable buttons when uninstalling
    for (const btn of this.getButtons()) btn.disabled = false;
  }
}
