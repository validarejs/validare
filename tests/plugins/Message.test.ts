import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src/index";
import { Message } from "../../src/plugins/core/Message";
import { makeForm } from "../helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Message", () => {
  it("inserts message container after field element on invalid", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { message: new Message() },
      fields: {
        email: {
          validators: { notEmpty: { message: "Email is required" } },
        },
      },
    });
    await fv.validate();
    const container = form.querySelector(".fv-plugins-message-container");
    expect(container).not.toBeNull();
    expect(container?.textContent).toContain("Email is required");
  });

  it("removes message text when field becomes valid", async () => {
    const form = makeForm({ email: "" });
    const emailInput = form.querySelector<HTMLInputElement>('[name="email"]')!;
    const fv = validare(form, {
      plugins: { message: new Message() },
      fields: {
        email: { validators: { notEmpty: { message: "Required" } } },
      },
    });

    await fv.validate();
    expect(form.querySelector(".fv-plugins-message-container")?.textContent).toContain("Required");

    // Fix the value and re-validate
    emailInput.value = "something";
    fv.reset();
    await fv.validate();
    expect(form.querySelector(".fv-plugins-message-container")?.textContent).toBe("");
  });

  it("removes message container from DOM on uninstall", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { message: new Message() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    expect(form.querySelector(".fv-plugins-message-container")).not.toBeNull();
    fv.destroy();
    expect(form.querySelector(".fv-plugins-message-container")).toBeNull();
  });
});
