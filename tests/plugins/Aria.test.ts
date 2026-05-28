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
    expect(input.getAttribute("aria-describedby")).toBeTruthy();

    input.value = "hello";
    fv.resetField("email");
    await fv.validateField("email");
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
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    fv.removeField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("uninstall removes all listeners and clears state", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { aria: new Aria() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });
    await fv.validateField("email");
    fv.deregisterPlugin("aria");
    fv.resetField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const attrBefore = input.getAttribute("aria-invalid");
    await fv.validateField("email");
    expect(input.getAttribute("aria-invalid")).toBe(attrBefore);
  });
});
