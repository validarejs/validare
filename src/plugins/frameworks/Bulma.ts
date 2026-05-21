import { Plugin } from '../../core/Plugin';
import type { ElementValidatedPayload } from '../../core/types';

export interface BulmaOptions {
  validClass?: string;
  invalidClass?: string;
  [key: string]: unknown;
}

export class Bulma extends Plugin<BulmaOptions> {
  private trackedElements = new Set<HTMLElement>();

  constructor(opts?: BulmaOptions) {
    super({ validClass: 'is-success', invalidClass: 'is-danger', ...opts });
  }

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid } = payload as ElementValidatedPayload;
    const validClass = this.opts.validClass ?? 'is-success';
    const invalidClass = this.opts.invalidClass ?? 'is-danger';
    element.classList.toggle(validClass, valid);
    element.classList.toggle(invalidClass, !valid);
    this.trackedElements.add(element);
  };

  install(): void {
    this.core.on('core.element.validated', this.onElementValidated);
  }

  uninstall(): void {
    this.core.off('core.element.validated', this.onElementValidated);
    const v = this.opts.validClass ?? 'is-success';
    const i = this.opts.invalidClass ?? 'is-danger';
    this.trackedElements.forEach((el) => el.classList.remove(v, i));
    this.trackedElements.clear();
  }
}
