import { afterEach, describe, expect, it } from "vitest";
import { validare } from "../../src/index";
import { makeForm } from "../helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("validare() integration", () => {
  it("validates notEmpty by name without explicit import", async () => {
    const form = makeForm({ email: "" });
    const fv = validare(form, {
      fields: { email: { validators: { notEmpty: {} } } },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("validates email by name without explicit import", async () => {
    const form = makeForm({ email: "not-an-email" });
    const fv = validare(form, {
      fields: { email: { validators: { email: {} } } },
    });
    expect(await fv.validate()).toBe("Invalid");
  });

  it("Valid when all fields pass", async () => {
    const form = makeForm({ email: "user@test.com" });
    const fv = validare(form, {
      fields: { email: { validators: { notEmpty: {}, email: {} } } },
    });
    expect(await fv.validate()).toBe("Valid");
  });

  it("multiple validators on same field — all must pass", async () => {
    const form = makeForm({ age: "5" });
    const fv = validare(form, {
      fields: {
        age: {
          validators: {
            integer: {},
            between: { min: 18, max: 99 },
          },
        },
      },
    });
    expect(await fv.validate()).toBe("Invalid");
  });
});
