import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src/index";
import { Excluded } from "../../src/plugins/core/Excluded";
import { makeForm } from "../helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Excluded", () => {
  it("excludes disabled inputs by default", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector<HTMLInputElement>('[name="name"]')!;
    input.disabled = true;

    const fv = validare(form, {
      plugins: { excluded: new Excluded() },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    // Disabled field should be excluded → Valid overall
    expect(await fv.validate()).toBe("Valid");
  });

  it("excludes hidden inputs by default", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector<HTMLInputElement>('[name="name"]')!;
    input.type = "hidden";

    const fv = validare(form, {
      plugins: { excluded: new Excluded() },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    expect(await fv.validate()).toBe("Valid");
  });

  it("excludes field matching custom selector", async () => {
    const form = makeForm({ name: "" });
    form.querySelector('[name="name"]')?.classList.add("skip-me");

    const fv = validare(form, {
      plugins: { excluded: new Excluded({ excluded: ".skip-me" }) },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    expect(await fv.validate()).toBe("Valid");
  });

  it("excludes field when custom function returns true", async () => {
    const form = makeForm({ name: "" });
    const fv = validare(form, {
      plugins: {
        excluded: new Excluded({
          excluded: (_field: string, _element: HTMLElement) => true,
        }),
      },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    expect(await fv.validate()).toBe("Valid");
  });

  it("does not exclude non-matching elements", async () => {
    const form = makeForm({ name: "" });
    const fv = validare(form, {
      plugins: { excluded: new Excluded() },
      fields: { name: { validators: { notEmpty: {} } } },
    });
    expect(await fv.validate()).toBe("Invalid");
  });
});
