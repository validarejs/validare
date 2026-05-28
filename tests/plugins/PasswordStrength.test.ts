import { afterEach, describe, expect, it, vi } from "vitest";
import { validare } from "../../src";
import { PasswordStrength } from "../../src/plugins/core/PasswordStrength";
import { makeForm } from "../helpers";

describe("PasswordStrength", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("fails validation when password score is below minScore", async () => {
    const form = makeForm({ password: "abc" }); // score 0
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password" }) },
      fields: { password: { validators: {} } },
    });
    const result = await fv.validateField("password");
    expect(result).toBe("Invalid");
  });

  it("passes validation when password score meets minScore", async () => {
    const form = makeForm({ password: "Abcdefg1" }); // score 3: length + upper + digit
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password" }) },
      fields: { password: { validators: {} } },
    });
    const result = await fv.validateField("password");
    expect(result).toBe("Valid");
  });

  it("uses custom minScore option", async () => {
    const form = makeForm({ password: "abcdefgh" }); // score 1: length only
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password", minScore: 1 }) },
      fields: { password: { validators: {} } },
    });
    const result = await fv.validateField("password");
    expect(result).toBe("Valid");
  });

  it("calls onScore callback with correct score and valid flag", async () => {
    const form = makeForm({ password: "Abcdefg1" }); // score 3
    const onScore = vi.fn();
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password", onScore }) },
      fields: { password: { validators: {} } },
    });
    await fv.validateField("password");
    expect(onScore).toHaveBeenCalledOnce();
    expect(onScore).toHaveBeenCalledWith({ field: "password", score: 3, valid: true });
  });

  it("returns score 0 for empty password", async () => {
    const form = makeForm({ password: "" });
    const onScore = vi.fn();
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password", onScore }) },
      fields: { password: { validators: {} } },
    });
    await fv.validateField("password");
    expect(onScore).toHaveBeenCalledWith({ field: "password", score: 0, valid: false });
  });

  it("scores all 4 criteria for a strong password", async () => {
    const form = makeForm({ password: "Abcdefg1!" }); // score 4
    const onScore = vi.fn();
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password", onScore }) },
      fields: { password: { validators: {} } },
    });
    await fv.validateField("password");
    expect(onScore).toHaveBeenCalledWith({ field: "password", score: 4, valid: true });
  });

  it("uses custom error message", async () => {
    const form = makeForm({ password: "abc" });
    const fv = validare(form, {
      plugins: {
        pwStrength: new PasswordStrength({
          field: "password",
          message: "Too weak!",
        }),
      },
      fields: { password: { validators: {} } },
    });
    let errorMessage = "";
    fv.on("core.element.validated", (payload) => {
      const p = payload as import("../../src/core/types").ElementValidatedPayload;
      for (const result of Object.values(p.validators)) {
        if (!result.valid && result.message) errorMessage = result.message;
      }
    });
    await fv.validateField("password");
    expect(errorMessage).toBe("Too weak!");
  });

  it("two instances on different fields do not conflict", async () => {
    const form = makeForm({ password: "abc", confirm: "Abcdefg1" });
    const onScore1 = vi.fn();
    const onScore2 = vi.fn();
    const fv = validare(form, {
      plugins: {
        pwStr1: new PasswordStrength({ field: "password", onScore: onScore1 }),
        pwStr2: new PasswordStrength({ field: "confirm", onScore: onScore2 }),
      },
      fields: {
        password: { validators: {} },
        confirm:  { validators: {} },
      },
    });
    await fv.validate();
    expect(onScore1).toHaveBeenCalledWith(expect.objectContaining({ field: "password", score: 0 }));
    expect(onScore2).toHaveBeenCalledWith(expect.objectContaining({ field: "confirm", score: 3 }));
  });

  it("uninstall removes the strength validator from the field", async () => {
    const form = makeForm({ password: "abc" });
    const fv = validare(form, {
      plugins: { pwStrength: new PasswordStrength({ field: "password" }) },
      fields: { password: { validators: {} } },
    });
    fv.deregisterPlugin("pwStrength");
    fv.resetField("password");
    // After uninstall, the strength validator is gone — field has no validators.
    // Core returns "Valid" when there are no active validators (nothing to fail).
    const result = await fv.validateField("password");
    expect(result).toBe("Valid");
  });
});
