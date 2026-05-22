import { describe, expect, it, vi } from "vitest";
import { Plugin } from "../../src/core/Plugin";

// Concrete subclass for testing
class TestPlugin extends Plugin<{ value: number }> {
  installCalled = false;
  uninstallCalled = false;

  install() {
    this.installCalled = true;
  }
  uninstall() {
    this.uninstallCalled = true;
  }
}

describe("Plugin", () => {
  it("stores options passed to constructor", () => {
    const p = new TestPlugin({ value: 42 });
    expect(p.opts).toEqual({ value: 42 });
  });

  it("uses empty object when no options provided", () => {
    const p = new TestPlugin();
    expect(p.opts).toEqual({});
  });

  it("is enabled by default", () => {
    const p = new TestPlugin();
    expect(p.isEnabled()).toBe(true);
  });

  it("disable() makes isEnabled() return false", () => {
    const p = new TestPlugin();
    p.disable();
    expect(p.isEnabled()).toBe(false);
  });

  it("enable() after disable() restores enabled state", () => {
    const p = new TestPlugin();
    p.disable();
    p.enable();
    expect(p.isEnabled()).toBe(true);
  });

  it("setCore() stores the core reference", () => {
    const p = new TestPlugin();
    const fakeCore = {} as never;
    p.setCore(fakeCore);
    expect(p.core).toBe(fakeCore);
  });

  it("install() and uninstall() are callable", () => {
    const p = new TestPlugin();
    p.install();
    p.uninstall();
    expect(p.installCalled).toBe(true);
    expect(p.uninstallCalled).toBe(true);
  });
});
