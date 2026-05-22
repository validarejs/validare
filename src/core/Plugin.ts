// src/core/Plugin.ts
import type { Core } from "./Core";

export abstract class Plugin<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Options passed by the user when instantiating the plugin */
  readonly opts: T;
  /** Set by Core.registerPlugin() before install() is called */
  protected core!: Core;
  private _enabled = true;

  constructor(opts?: Partial<T>) {
    this.opts = (opts ?? {}) as T;
  }

  /** Called by Core.registerPlugin() — gives plugin access to the core instance */
  setCore(core: Core): void {
    this.core = core;
  }

  /** Called after setCore(). Add event listeners and filters here. */
  install(): void {}

  /** Called by Core.deregisterPlugin() and Core.destroy(). Remove everything install() added. */
  uninstall(): void {}

  /** Re-enable after disable() */
  enable(): void {
    this._enabled = true;
  }

  /** Temporarily suspend plugin without uninstalling */
  disable(): void {
    this._enabled = false;
  }

  isEnabled(): boolean {
    return this._enabled;
  }
}
