import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Core } from "../../src/core/Core";
import { Plugin } from "../../src/core/Plugin";
import { validare } from "../../src";
import { makeForm } from "../helpers";

let form: HTMLFormElement;

beforeEach(() => {
  form = makeForm({ email: "test@test.com", name: "Alice" });
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Core — field management", () => {
  it("addField() finds elements by name selector by default", () => {
    const core = new Core(form);
    core.addField("email", { validators: {} });
    expect(core.getElements("email")).toHaveLength(1);
  });

  it("addField() uses custom selector when provided", () => {
    const core = new Core(form);
    core.addField("email", { selector: '[name="email"]', validators: {} });
    expect(core.getElements("email")).toHaveLength(1);
  });

  it("addField() emits core.field.added", () => {
    const core = new Core(form);
    const handler = vi.fn();
    core.on("core.field.added", handler);
    core.addField("email", { validators: {} });
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ field: "email" }));
  });

  it("removeField() emits core.field.removed", () => {
    const core = new Core(form);
    core.addField("email", { validators: {} });
    const handler = vi.fn();
    core.on("core.field.removed", handler);
    core.removeField("email");
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ field: "email" }));
  });

  it("removeField() on unknown field throws", () => {
    const core = new Core(form);
    expect(() => core.removeField("nope")).toThrow();
  });
});

describe("Core — plugin management", () => {
  it("registerPlugin() calls setCore() and install()", () => {
    const core = new Core(form);
    const plugin = new (class extends Plugin {
      install = vi.fn();
    })();
    const setCore = vi.spyOn(plugin, "setCore");
    core.registerPlugin("test", plugin);
    expect(setCore).toHaveBeenCalledWith(core);
    expect(plugin.install).toHaveBeenCalled();
  });

  it("registerPlugin() throws on duplicate name", () => {
    const core = new Core(form);
    class P extends Plugin {}
    core.registerPlugin("dupe", new P());
    expect(() => core.registerPlugin("dupe", new P())).toThrow();
  });

  it("deregisterPlugin() calls uninstall()", () => {
    const core = new Core(form);
    const plugin = new (class extends Plugin {
      uninstall = vi.fn();
    })();
    core.registerPlugin("test", plugin);
    core.deregisterPlugin("test");
    expect(plugin.uninstall).toHaveBeenCalled();
  });
});

describe("Core — validator registration", () => {
  it("registerValidator() stores the factory", async () => {
    const core = new Core(form);
    core.registerValidator("alwaysValid", () => ({
      validate: () => ({ valid: true }),
    }));
    core.addField("email", { validators: { alwaysValid: {} } });
    const result = await core.validateField("email");
    expect(result).toBe("Valid");
  });

  it("unknown validator name returns NotValidated", async () => {
    const core = new Core(form);
    core.addField("email", { validators: { unknownValidator: {} } });
    const result = await core.validateField("email");
    expect(result).toBe("NotValidated");
  });
});

describe("Core — validation", () => {
  it("validates all fields and returns Valid when all pass", async () => {
    const core = new Core(form);
    core.registerValidator("ok", () => ({ validate: () => ({ valid: true }) }));
    core.addField("email", { validators: { ok: {} } });
    core.addField("name", { validators: { ok: {} } });
    const result = await core.validate();
    expect(result).toBe("Valid");
  });

  it("returns Invalid when any field fails", async () => {
    const core = new Core(form);
    core.registerValidator("fail", () => ({ validate: () => ({ valid: false }) }));
    core.addField("email", { validators: { fail: {} } });
    const result = await core.validate();
    expect(result).toBe("Invalid");
  });

  it("disabled validator is skipped", async () => {
    const core = new Core(form);
    core.registerValidator("fail", () => ({ validate: () => ({ valid: false }) }));
    core.addField("email", { validators: { fail: { enabled: false } } });
    const result = await core.validateField("email");
    expect(result).toBe("Valid");
  });

  it("emits core.form.valid on success", async () => {
    const core = new Core(form);
    core.registerValidator("ok", () => ({ validate: () => ({ valid: true }) }));
    core.addField("email", { validators: { ok: {} } });
    const handler = vi.fn();
    core.on("core.form.valid", handler);
    await core.validate();
    expect(handler).toHaveBeenCalled();
  });

  it("emits core.form.invalid on failure", async () => {
    const core = new Core(form);
    core.registerValidator("fail", () => ({ validate: () => ({ valid: false }) }));
    core.addField("email", { validators: { fail: {} } });
    const handler = vi.fn();
    core.on("core.form.invalid", handler);
    await core.validate();
    expect(handler).toHaveBeenCalled();
  });

  it("field with no DOM elements returns NotValidated", async () => {
    const core = new Core(form);
    core.addField("ghost", { validators: { ok: {} } });
    const result = await core.validateField("ghost");
    expect(result).toBe("NotValidated");
  });

  it("enableValidator() and disableValidator() affect validation", async () => {
    const core = new Core(form);
    core.registerValidator("fail", () => ({ validate: () => ({ valid: false }) }));
    core.addField("email", { validators: { fail: {} } });
    expect(await core.validateField("email")).toBe("Invalid");
    core.disableValidator("email", "fail");
    core.reset();
    expect(await core.validateField("email")).toBe("Valid");
    core.enableValidator("email", "fail");
    core.reset();
    expect(await core.validateField("email")).toBe("Invalid");
  });

  it("reset() clears cached results", async () => {
    const core = new Core(form);
    core.registerValidator("fail", () => ({ validate: () => ({ valid: false }) }));
    core.addField("email", { validators: { fail: {} } });
    await core.validateField("email");
    core.reset();
    // After reset, result should not be cached
    const handler = vi.fn();
    core.on("core.field.validating", handler);
    await core.validateField("email");
    expect(handler).toHaveBeenCalled();
  });

  it("destroy() calls uninstall on all plugins", () => {
    const core = new Core(form);
    const p = new (class extends Plugin {
      uninstall = vi.fn();
    })();
    core.registerPlugin("p", p);
    core.destroy();
    expect(p.uninstall).toHaveBeenCalled();
  });

  it("supports async validators", async () => {
    const core = new Core(form);
    core.registerValidator("asyncOk", () => ({
      validate: () => Promise.resolve({ valid: true }),
    }));
    core.addField("email", { validators: { asyncOk: {} } });
    expect(await core.validateField("email")).toBe("Valid");
  });
});

describe("Core — getValidatorResult", () => {
  it("returns NotValidated before any validation", () => {
    const core = new Core(form);
    core.addField("email", { validators: {} });
    expect(core.getValidatorResult("email", "notEmpty")).toBe("NotValidated");
  });

  it("returns correct result after validation", async () => {
    const core = new Core(form);
    core.registerValidator("ok", () => ({ validate: () => ({ valid: true }) }));
    core.addField("email", { validators: { ok: {} } });
    await core.validateField("email");
    expect(core.getValidatorResult("email", "ok")).toBe("Valid");
  });
});

describe("Core.removeValidator", () => {
  it("removes a validator from a field so it no longer runs", async () => {
    const form = makeForm({ email: "notanemail" });
    const fv = validare(form, {
      fields: { email: { validators: { notEmpty: {}, email: {} } } },
    });
    fv.removeValidator("email", "email");
    // Only notEmpty remains — 'notanemail' is not empty, so Valid
    const result = await fv.validateField("email");
    expect(result).toBe("Valid");
  });

  it("is a no-op for unknown field or validator", () => {
    const form = makeForm({ email: "test@test.com" });
    const fv = validare(form, {
      fields: { email: { validators: { notEmpty: {} } } },
    });
    expect(() => fv.removeValidator("unknown", "notEmpty")).not.toThrow();
    expect(() => fv.removeValidator("email", "unknown")).not.toThrow();
  });
});

describe("Core.deregisterValidator", () => {
  it("removes a validator factory from the global registry", async () => {
    const form = makeForm({ val: "" });
    const fv = validare(form, {
      fields: { val: { validators: { notEmpty: {} } } },
    });
    // Confirm notEmpty runs and flags empty value as Invalid before deregistering
    const before = await fv.validateField("val");
    expect(before).toBe("Invalid");

    fv.reset();
    fv.deregisterValidator("notEmpty");
    // Factory gone — validator entry remains in field map but has no factory → NotValidated
    const result = await fv.validateField("val");
    expect(result).toBe("NotValidated");
  });
});

describe("Core field-value filter", () => {
  it("allows a plugin to transform the value seen by a specific validator", async () => {
    const form = makeForm({ phone: "(555) 123-4567" });
    const fv = validare(form, {
      fields: { phone: { validators: { digits: {} } } },
    });
    // Without transform: fails digits
    const before = await fv.validateField("phone");
    expect(before).toBe("Invalid");

    fv.reset();
    // Register a field-value filter that strips non-digits for the digits validator
    fv.registerFilter(
      "field-value",
      (defaultValue: unknown, field: unknown, _el: unknown, validator: unknown) => {
        if (field === "phone" && validator === "digits") {
          return (defaultValue as string).replace(/\D/g, "");
        }
        return defaultValue;
      },
    );
    const after = await fv.validateField("phone");
    expect(after).toBe("Valid");
  });
});
