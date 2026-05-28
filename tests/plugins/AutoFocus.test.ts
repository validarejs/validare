import { afterEach, describe, expect, it, vi } from "vitest";
import { validare } from "../../src";
import { AutoFocus } from "../../src/plugins/core/AutoFocus";
import { makeForm } from "../helpers";

describe("AutoFocus", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("focuses the first invalid field after form.validate()", async () => {
    const form = makeForm({ name: "", email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        name:  { validators: { notEmpty: { message: "Name required" } } },
        email: { validators: { notEmpty: { message: "Email required" } } },
      },
    });
    const nameInput  = form.querySelector('[name="name"]')  as HTMLInputElement;
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    nameInput.focus  = vi.fn();
    emailInput.focus = vi.fn();

    await fv.validate();

    expect(nameInput.focus).toHaveBeenCalledOnce();
    expect(emailInput.focus).not.toHaveBeenCalled();
  });

  it("focuses the first still-invalid field when earlier fields become valid", async () => {
    const form = makeForm({ name: "", email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        name:  { validators: { notEmpty: { message: "Name required" } } },
        email: { validators: { notEmpty: { message: "Email required" } } },
      },
    });
    const nameInput  = form.querySelector('[name="name"]')  as HTMLInputElement;
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;

    nameInput.focus  = vi.fn();
    emailInput.focus = vi.fn();
    await fv.validate();
    expect(nameInput.focus).toHaveBeenCalledOnce();

    nameInput.value = "Alice";
    fv.resetField("name");
    fv.resetField("email");
    nameInput.focus  = vi.fn();
    emailInput.focus = vi.fn();
    await fv.validate();
    expect(nameInput.focus).not.toHaveBeenCalled();
    expect(emailInput.focus).toHaveBeenCalledOnce();
  });

  it("does not focus when form is valid", async () => {
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        name: { validators: { notEmpty: { message: "Name required" } } },
      },
    });
    const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
    nameInput.focus = vi.fn();

    await fv.validate();

    expect(nameInput.focus).not.toHaveBeenCalled();
  });

  it("calls onPrefocus callback before focusing", async () => {
    const form = makeForm({ email: "" });
    const callOrder: string[] = [];
    const prefocusSpy = vi.fn().mockImplementation(() => callOrder.push("prefocus"));
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus({ onPrefocus: prefocusSpy }) },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    emailInput.focus = vi.fn().mockImplementation(() => callOrder.push("focus"));

    await fv.validate();

    expect(prefocusSpy).toHaveBeenCalledOnce();
    expect(prefocusSpy).toHaveBeenCalledWith({ field: "email", element: emailInput });
    expect(emailInput.focus).toHaveBeenCalledOnce();
    expect(callOrder).toEqual(["prefocus", "focus"]);
  });

  it("does nothing when disabled", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus({ enabled: false }) },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    emailInput.focus = vi.fn();

    await fv.validate();

    expect(emailInput.focus).not.toHaveBeenCalled();
  });

  it("cleans up status on field removed", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validate();
    fv.removeField("email");

    fv.addField("email", { validators: { notEmpty: { message: "Required" } } });
    const newInput = form.querySelector('[name="email"]') as HTMLInputElement;
    newInput.focus = vi.fn();
    await fv.validate();
    expect(newInput.focus).toHaveBeenCalledOnce();
  });

  it("clears all statuses on form reset", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validate();
    fv.reset();

    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    emailInput.focus = vi.fn();
    await fv.validateField("email");
    expect(emailInput.focus).not.toHaveBeenCalled();
  });

  it("uninstall stops focus behavior", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { autoFocus: new AutoFocus() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    fv.deregisterPlugin("autoFocus");

    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    emailInput.focus = vi.fn();
    await fv.validate();
    expect(emailInput.focus).not.toHaveBeenCalled();
  });
});
