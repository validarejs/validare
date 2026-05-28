import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src";
import { Declarative } from "../../src/plugins/core/Declarative";
import { makeForm } from "../helpers";

describe("Declarative", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Basic attribute parsing ──────────────────────────────────────────────

  it("enables a validator from data-fv-{validator}='true' attribute", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-not-empty", "true");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("disables a validator when data-fv-{validator}='false'", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-not-empty", "false");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
    });
    // notEmpty is disabled — empty value should pass
    expect(await fv.validate()).toBe("Valid");
  });

  it("sets a string option from data-fv-{validator}___{option}", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-not-empty", "true");
    input.setAttribute("data-fv-not-empty___message", "Name is required");

    const plugin = new Declarative();
    validare(form, { plugins: { declarative: plugin } });

    const { validators } = plugin.parseElement(input);
    expect(validators.notEmpty.message).toBe("Name is required");
  });

  it("coerces numeric option to number", () => {
    const form = makeForm({ name: "ab" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-string-length", "true");
    input.setAttribute("data-fv-string-length___min", "3");

    const plugin = new Declarative();
    validare(form, { plugins: { declarative: plugin } });

    const { validators } = plugin.parseElement(input);
    expect(validators.stringLength.min).toBe(3);
    expect(typeof validators.stringLength.min).toBe("number");
  });

  it("coerces 'true' and '' attribute values to boolean true", () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-between___inclusive", "true");
    input.setAttribute("data-fv-between___other", "");

    const plugin = new Declarative();
    validare(form, { plugins: { declarative: plugin } });

    const { validators } = plugin.parseElement(input);
    expect(validators.between.inclusive).toBe(true);
    expect(validators.between.other).toBe(true);
  });

  it("coerces 'false' attribute value to boolean false", () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-between___inclusive", "false");

    const plugin = new Declarative();
    validare(form, { plugins: { declarative: plugin } });

    const { validators } = plugin.parseElement(input);
    expect(validators.between.inclusive).toBe(false);
  });

  it("converts kebab-case attribute names to camelCase", async () => {
    const form = makeForm({ name: "ab" }); // too short
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    // data-fv-string-length → stringLength
    input.setAttribute("data-fv-string-length", "true");
    input.setAttribute("data-fv-string-length___min", "3");

    const fv = validare(form, { plugins: { declarative: new Declarative() } });
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Purely declarative fields (no programmatic field config) ────────────

  it("registers a field purely from declarative attributes (no programmatic config)", async () => {
    const form = makeForm({ email: "not-an-email" });
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    input.setAttribute("data-fv-email", "true");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("uses data-fv-field as fallback field name when name attribute is absent", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);
    const input = document.createElement("input");
    input.setAttribute("data-fv-field", "custom");
    input.setAttribute("data-fv-not-empty", "true");
    input.value = "";
    form.appendChild(input);

    const fv = validare(form, { plugins: { declarative: new Declarative() } });
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Programmatic precedence ──────────────────────────────────────────────

  it("programmatic validators take precedence over declarative", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    // Declarative says notEmpty is disabled
    input.setAttribute("data-fv-not-empty", "false");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
      // Programmatic says notEmpty is enabled
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    // Programmatic wins — empty field should fail
    expect(await fv.validate()).toBe("Invalid");
  });

  it("adds declarative validators for names not in programmatic config", async () => {
    const form = makeForm({ name: "ab" }); // fails stringLength min=3
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    // Only stringLength in declarative; notEmpty programmatic
    input.setAttribute("data-fv-string-length", "true");
    input.setAttribute("data-fv-string-length___min", "3");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });
    // Both validators run: notEmpty passes ("ab" not empty), stringLength fails (length < 3)
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Custom prefix ────────────────────────────────────────────────────────

  it("respects custom prefix option", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-val-not-empty", "true");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ prefix: "data-val-" }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── html5Input option ────────────────────────────────────────────────────

  it("html5Input: required attribute enables notEmpty", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("required", "");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: type=email enables email validator", async () => {
    const form = makeForm({ email: "not-an-email" });
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    input.setAttribute("type", "email");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: minlength enables stringLength with min", async () => {
    const form = makeForm({ name: "ab" }); // 2 chars
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("minlength", "3");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: maxlength enables stringLength with max", async () => {
    const form = makeForm({ name: "hello!" }); // 6 chars
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("maxlength", "5");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: pattern enables regexp validator", async () => {
    const form = makeForm({ code: "abc123" }); // contains digits
    const input = form.querySelector('[name="code"]') as HTMLInputElement;
    input.setAttribute("pattern", "^[a-z]+$"); // only lowercase letters

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: min (non-range) enables greaterThan", async () => {
    const form = makeForm({ age: "15" });
    const input = form.querySelector('[name="age"]') as HTMLInputElement;
    input.setAttribute("min", "18");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("html5Input: max (non-range) enables lessThan", async () => {
    const form = makeForm({ age: "200" });
    const input = form.querySelector('[name="age"]') as HTMLInputElement;
    input.setAttribute("max", "120");

    const fv = validare(form, {
      plugins: { declarative: new Declarative({ html5Input: true }) },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Dynamic fields ───────────────────────────────────────────────────────

  it("picks up declarative attrs when a field is added dynamically", async () => {
    const form = makeForm({ name: "Alice" });
    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
      fields: { name: { validators: { notEmpty: { message: "Required" } } } },
    });

    // Add new input with declarative attrs after validare() initialised
    const emailInput = document.createElement("input");
    emailInput.setAttribute("name", "email");
    emailInput.setAttribute("data-fv-not-empty", "true");
    emailInput.value = ""; // empty — should fail
    form.appendChild(emailInput);

    // Add the field to core with no programmatic validators
    fv.addField("email", { validators: {} });

    expect(await fv.validate()).toBe("Invalid");
  });

  // ── Uninstall / disabled ─────────────────────────────────────────────────

  it("does not add declarative validators after uninstall", async () => {
    const form = makeForm({ name: "" });
    const input = form.querySelector('[name="name"]') as HTMLInputElement;
    input.setAttribute("data-fv-not-empty", "true");

    const fv = validare(form, {
      plugins: { declarative: new Declarative() },
    });
    fv.deregisterPlugin("declarative");

    // The field was already added by install() — this test verifies no errors
    // and that the deregistered plugin doesn't crash
    expect(await fv.validate()).toBe("Invalid"); // notEmpty was added during install
  });
});
