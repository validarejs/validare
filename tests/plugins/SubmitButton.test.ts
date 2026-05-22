import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src/index";
import { SubmitButton } from "../../src/plugins/core/SubmitButton";
import { makeForm } from "../helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

function addSubmitButton(form: HTMLFormElement): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "submit";
  form.appendChild(btn);
  return btn;
}

describe("SubmitButton", () => {
  it("disables submit button during validation and re-enables after", async () => {
    const form = makeForm({ email: "test@test.com" });
    const btn = addSubmitButton(form);

    const fv = validare(form, {
      plugins: { submitButton: new SubmitButton() },
      fields: { email: { validators: { notEmpty: {} } } },
    });

    const validatePromise = fv.validate();
    // Button should be disabled immediately after validation starts
    expect(btn.disabled).toBe(true);
    await validatePromise;
    // Button re-enabled after validation completes
    expect(btn.disabled).toBe(false);
  });

  it("re-enables button even when validation returns Invalid", async () => {
    const form = makeForm({ email: "" });
    const btn = addSubmitButton(form);
    const fv = validare(form, {
      plugins: { submitButton: new SubmitButton() },
      fields: { email: { validators: { notEmpty: {} } } },
    });
    await fv.validate();
    expect(btn.disabled).toBe(false);
  });
});
