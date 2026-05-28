import { afterEach, describe, expect, it, vi } from "vitest";
import { validare } from "../../src";
import { FieldStatus } from "../../src/plugins/core/FieldStatus";
import { makeForm } from "../helpers";

describe("FieldStatus", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("initializes field status as NotValidated when field is added", () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    expect(plugin.getStatuses().get("name")).toBe("NotValidated");
  });

  it("tracks field status as Valid after successful validation", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.getStatuses().get("name")).toBe("Valid");
  });

  it("tracks field status as Invalid after failed validation", async () => {
    const form = makeForm({ name: "" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.getStatuses().get("name")).toBe("Invalid");
  });

  it("sets status to Validating during async validation, then Valid on resolve", async () => {
    let resolveCallback!: (r: { valid: boolean }) => void;
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: {
        name: {
          validators: {
            callback: {
              message: "Invalid",
              callback: () =>
                new Promise<{ valid: boolean }>((r) => {
                  resolveCallback = r;
                }),
            },
          },
        },
      },
    });
    // core.field.validating fires inside the validate-pre microtask chain
    const p = fv.validate();
    await Promise.resolve(); // advance past the validate-pre microtask so validateField runs
    expect(plugin.getStatuses().get("name")).toBe("Validating");
    resolveCallback({ valid: true });
    await p;
    expect(plugin.getStatuses().get("name")).toBe("Valid");
  });

  it("areFieldsValid() returns true when all fields are NotValidated", () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    expect(plugin.areFieldsValid()).toBe(true);
  });

  it("areFieldsValid() returns false when a field is Invalid", async () => {
    const form = makeForm({ name: "" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.areFieldsValid()).toBe(false);
  });

  it("areFieldsValid() returns true when all fields are Valid", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.areFieldsValid()).toBe(true);
  });

  it("calls onStatusChanged(false) when a field becomes invalid", async () => {
    const onStatusChanged = vi.fn();
    const form = makeForm({ name: "" });
    const fv = validare(form, {
      plugins: { fieldStatus: new FieldStatus({ onStatusChanged }) },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(onStatusChanged).toHaveBeenLastCalledWith(false);
  });

  it("calls onStatusChanged(true) when all fields are valid", async () => {
    const onStatusChanged = vi.fn();
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { fieldStatus: new FieldStatus({ onStatusChanged }) },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(onStatusChanged).toHaveBeenLastCalledWith(true);
  });

  it("resets all field statuses to NotValidated after fv.reset()", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.getStatuses().get("name")).toBe("Valid");
    fv.reset();
    expect(plugin.getStatuses().get("name")).toBe("NotValidated");
  });

  it("removes field from statuses when field is removed", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    fv.removeField("name");
    expect(plugin.getStatuses().has("name")).toBe(false);
  });

  it("getStatuses() returns empty map when disabled", async () => {
    const form = makeForm({ name: "Alice" });
    const plugin = new FieldStatus({ enabled: false });
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(plugin.getStatuses().size).toBe(0);
  });

  it("does not call onStatusChanged when disabled", async () => {
    const onStatusChanged = vi.fn();
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { fieldStatus: new FieldStatus({ enabled: false, onStatusChanged }) },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(onStatusChanged).not.toHaveBeenCalled();
  });

  it("stops tracking after uninstall", async () => {
    const form = makeForm({ name: "" });
    const plugin = new FieldStatus();
    const fv = validare(form, {
      plugins: { fieldStatus: plugin },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    fv.deregisterPlugin("fieldStatus");
    await fv.validate();
    // statuses cleared on uninstall, plugin no longer receives events
    expect(plugin.getStatuses().size).toBe(0);
  });
});
