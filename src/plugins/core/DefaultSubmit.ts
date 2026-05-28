import { Plugin } from "../../core/Plugin";

export interface DefaultSubmitOptions {
  [key: string]: unknown;
}

export class DefaultSubmit extends Plugin<DefaultSubmitOptions> {
  constructor(opts?: DefaultSubmitOptions) {
    super({ ...opts });
    if (opts?.enabled === false) this.disable();
  }

  private onFormValid = (): void => {
    if (!this.isEnabled()) return;
    this.core.form.submit();
  };

  install(): void {
    if (this.core.form.querySelectorAll('[type="submit"][name="submit"]').length > 0) {
      throw new Error(
        'DefaultSubmit: do not use "submit" as the name of a submit button — it shadows form.submit()',
      );
    }
    this.core.on("core.form.valid", this.onFormValid);
  }

  uninstall(): void {
    this.core.off("core.form.valid", this.onFormValid);
  }
}
