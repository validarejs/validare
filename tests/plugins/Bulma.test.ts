import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src/index";
import { Bulma } from "../../src/plugins/frameworks/Bulma";
import { makeForm } from "../helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Bulma", () => {
  it("adds is-danger to invalid field", async () => {
    const form = makeForm({ name: "" });
    const fv = validare(form, {
      plugins: { ui: new Bulma() },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    expect(form.querySelector('[name="name"]')?.classList.contains("is-danger")).toBe(true);
  });

  it("adds is-success to valid field", async () => {
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { ui: new Bulma() },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    expect(form.querySelector('[name="name"]')?.classList.contains("is-success")).toBe(true);
  });
});
