import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src/index";
import { Bootstrap5 } from "../../src/plugins/frameworks/Bootstrap5";
import { makeForm } from "../helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Bootstrap5", () => {
  it("adds is-invalid to invalid field", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { ui: new Bootstrap5() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    const input = form.querySelector('[name="email"]')!;
    expect(input.classList.contains("is-invalid")).toBe(true);
    expect(input.classList.contains("is-valid")).toBe(false);
  });

  it("adds is-valid to valid field", async () => {
    const form = makeForm({ email: "hi" });
    const fv = validare(form, {
      plugins: { ui: new Bootstrap5() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    const input = form.querySelector('[name="email"]')!;
    expect(input.classList.contains("is-valid")).toBe(true);
    expect(input.classList.contains("is-invalid")).toBe(false);
  });

  it("removes validation classes on uninstall", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { ui: new Bootstrap5() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    fv.destroy();
    const input = form.querySelector('[name="email"]')!;
    expect(input.classList.contains("is-invalid")).toBe(false);
  });
});
