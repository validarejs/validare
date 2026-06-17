import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src";
import { Tooltip } from "../../src/plugins/core/Tooltip";
import { makeForm } from "../helpers";

describe("Tooltip", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("creates tooltip element in document.body on install", () => {
    const form = makeForm({ email: "" });
    validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: {} } },
    });
    const tip = document.querySelector(".vd-plugins-tooltip");
    expect(tip).toBeTruthy();
    expect(document.body.contains(tip)).toBe(true);
  });

  it("shows tooltip message on mouseenter (hover trigger, default)", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Email is required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;

    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(false);
    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(true);
    expect(tip.textContent).toBe("Email is required");
  });

  it("hides tooltip on mouseleave", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Email is required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(true);
    input.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(false);
  });

  it("shows tooltip on click with click trigger", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip({ trigger: "click" }) },
      fields: { email: { validators: { notEmpty: { message: "Email is required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(true);
    expect(tip.textContent).toBe("Email is required");
  });

  it("hides tooltip on document click (click trigger)", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip({ trigger: "click" }) },
      fields: { email: { validators: { notEmpty: { message: "Email is required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(true);

    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(false);
  });

  it("does not show tooltip for valid field", async () => {
    const form = makeForm({ email: "test@test.com" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(false);
    expect(tip.textContent).toBe("");
  });

  it("hides tooltip when field transitions from invalid to valid", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(true);

    input.value = "filled";
    fv.resetField("email");
    await fv.validateField("email");
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(false);
  });

  it("cleans up on field removed", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(true);

    fv.removeField("email");
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(false);
  });

  it("removes tooltip from document.body on uninstall", () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip() },
      fields: { email: { validators: {} } },
    });
    expect(document.querySelector(".vd-plugins-tooltip")).toBeTruthy();
    fv.deregisterPlugin("tooltip");
    expect(document.querySelector(".vd-plugins-tooltip")).toBeNull();
  });

  it("does nothing when disabled", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      plugins: { tooltip: new Tooltip({ enabled: false }) },
      fields: { email: { validators: { notEmpty: { message: "Required" } } } },
    });
    await fv.validateField("email");
    const input = form.querySelector('[name="email"]') as HTMLInputElement;
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;

    input.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    expect(tip.classList.contains("vd-plugins-tooltip--show")).toBe(false);
  });

  it("applies placement class to tooltip element", () => {
    const form = makeForm({ email: "" });
    validare(form, {
      plugins: { tooltip: new Tooltip({ placement: "bottom" }) },
      fields: { email: { validators: {} } },
    });
    const tip = document.querySelector(".vd-plugins-tooltip") as HTMLElement;
    expect(tip.classList.contains("vd-plugins-tooltip--bottom")).toBe(true);
  });
});
