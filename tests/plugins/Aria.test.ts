import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src";
import { Aria } from "../../src/plugins/core/Aria";
import { Message } from "../../src/plugins/core/Message";
import { makeForm } from "../helpers";

describe("Aria", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("sets aria-invalid=true on invalid element", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid=false on valid element", async () => {
    const form = makeForm({ email: "hello" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("false");
  });

  it("sets aria-describedby and role=alert on message container when Message plugin is present", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { message: new Message(), aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const container = form.querySelector(".fv-plugins-message-container") as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.id).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe(container.id);
    expect(container.getAttribute("role")).toBe("alert");
  });

  it("removes aria-describedby when field becomes valid", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { message: new Message(), aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    // After first invalid run, aria-describedby should be set
    expect(input.getAttribute("aria-describedby")).toBeTruthy();

    // Reset cache and re-validate with a valid value
    input.value = "hello";
    fv.resetField("email"); // clears result cache only, does NOT remove aria attributes
    await fv.validateField("email");
    // After valid run, aria-describedby must be removed
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("sets aria-invalid without Message plugin (no aria-describedby)", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("cleans up aria attributes on field removed", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { message: new Message(), aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    // Both attributes should be set after invalid validation
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    fv.removeField("email");
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("removes role=alert and id from container when field becomes valid", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { message: new Message(), aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    const container = form.querySelector(".fv-plugins-message-container") as HTMLElement;
    expect(container.getAttribute("role")).toBe("alert");
    expect(container.id).toBeTruthy();

    // Reset and re-validate with valid value
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    input.value = "hello";
    fv.resetField("email");
    await fv.validateField("email");
    expect(container.getAttribute("role")).toBeNull();
    expect(container.id).toBe("");
  });

  it("uninstall removes all listeners and clears state", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    // First validation: field is invalid, aria-invalid should be "true"
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");

    // Uninstall the plugin
    fv.deregisterPlugin("aria");

    // Reset cache so next validateField actually runs
    fv.resetField("email");
    // Re-validate: without Aria plugin, aria-invalid must remain "true" (unchanged)
    await fv.validateField("email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});
