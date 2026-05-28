import { afterEach, describe, expect, it, vi } from "vitest";
import { validare } from "../../src";
import { DefaultSubmit } from "../../src/plugins/core/DefaultSubmit";
import { makeForm } from "../helpers";

describe("DefaultSubmit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("calls form.submit() when all fields are valid", async () => {
    const form = makeForm({ name: "Alice" });
    form.submit = vi.fn();
    const fv = validare(form, {
      plugins: { defaultSubmit: new DefaultSubmit() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(form.submit).toHaveBeenCalledOnce();
  });

  it("does not call form.submit() when a field is invalid", async () => {
    const form = makeForm({ name: "" });
    form.submit = vi.fn();
    const fv = validare(form, {
      plugins: { defaultSubmit: new DefaultSubmit() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(form.submit).not.toHaveBeenCalled();
  });

  it("does not call form.submit() when disabled", async () => {
    const form = makeForm({ name: "Alice" });
    form.submit = vi.fn();
    const fv = validare(form, {
      plugins: { defaultSubmit: new DefaultSubmit({ enabled: false }) },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validate();
    expect(form.submit).not.toHaveBeenCalled();
  });

  it("does not call form.submit() after uninstall", async () => {
    const form = makeForm({ name: "Alice" });
    form.submit = vi.fn();
    const fv = validare(form, {
      plugins: { defaultSubmit: new DefaultSubmit() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    fv.deregisterPlugin("defaultSubmit");
    await fv.validate();
    expect(form.submit).not.toHaveBeenCalled();
  });

  it('throws on install if a submit button has name="submit"', () => {
    const form = makeForm({ name: "Alice" });
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.name = "submit";
    form.appendChild(btn);

    expect(() => {
      validare(form, {
        plugins: { defaultSubmit: new DefaultSubmit() },
        fields: { name: { validators: {} } },
      });
    }).toThrow('do not use "submit" as the name of a submit button');
  });
});
