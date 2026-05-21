import { Plugin } from '../../core/Plugin';
import type { ElementValidatedPayload } from '../../core/types';

export interface MessageOptions {
  /** CSS selector for a custom message container. If omitted, a div is inserted after the field. */
  container?: string;
  /** CSS class added to the message container element */
  clazz?: string;
  [key: string]: unknown;
}

export class Message extends Plugin<MessageOptions> {
  /** Map from field element → message container element */
  private containers = new Map<HTMLElement, HTMLElement>();

  constructor(opts?: MessageOptions) {
    super(opts);
  }

  private onElementValidated = (payload: unknown): void => {
    if (!this.isEnabled()) return;
    const { element, valid, validators } = payload as ElementValidatedPayload;

    let container = this.containers.get(element);
    if (!container) {
      container = document.createElement('div');
      container.className = this.opts.clazz ?? 'fv-plugins-message-container';

      const customContainer = this.opts.container
        ? document.querySelector(this.opts.container)
        : null;

      if (customContainer) {
        customContainer.appendChild(container);
      } else {
        element.parentNode?.insertBefore(container, element.nextSibling);
      }
      this.containers.set(element, container);
    }

    container.innerHTML = '';
    if (!valid) {
      for (const [, result] of Object.entries(validators)) {
        if (!result.valid && result.message) {
          const msg = document.createElement('div');
          msg.className = 'fv-plugins-message';
          msg.textContent = result.message;
          container.appendChild(msg);
        }
      }
    }
  };

  private onFieldRemoved = (payload: unknown): void => {
    const { elements } = payload as { elements: HTMLElement[] };
    for (const el of elements) {
      const container = this.containers.get(el);
      if (container) {
        container.parentNode?.removeChild(container);
        this.containers.delete(el);
      }
    }
  };

  install(): void {
    this.core.on('core.element.validated', this.onElementValidated);
    this.core.on('core.field.removed', this.onFieldRemoved);
  }

  uninstall(): void {
    this.core.off('core.element.validated', this.onElementValidated);
    this.core.off('core.field.removed', this.onFieldRemoved);
    this.containers.forEach((container) => {
      container.parentNode?.removeChild(container);
    });
    this.containers.clear();
  }
}
