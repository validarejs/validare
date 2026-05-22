import { describe, expect, it } from "vitest";
import { email } from "../../src/validators/email";
import { makeInput } from "../helpers";

describe("email", () => {
  const v = email();

  it("valid for standard email", () => {
    expect(v.validate(makeInput("user@example.com"))).toEqual({ valid: true });
  });

  it("valid for email with subdomain", () => {
    expect(v.validate(makeInput("user@mail.example.co.uk"))).toEqual({ valid: true });
  });

  it("valid for email with plus sign", () => {
    expect(v.validate(makeInput("user+tag@example.com"))).toEqual({ valid: true });
  });

  it("invalid without @", () => {
    expect(v.validate(makeInput("userexample.com"))).toEqual({ valid: false });
  });

  it("invalid without domain", () => {
    expect(v.validate(makeInput("user@"))).toEqual({ valid: false });
  });

  it("invalid with spaces", () => {
    expect(v.validate(makeInput("user @example.com"))).toEqual({ valid: false });
  });

  it("invalid for empty string", () => {
    expect(v.validate(makeInput(""))).toEqual({ valid: false });
  });
});
