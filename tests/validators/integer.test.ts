import { describe, expect, it } from "vitest";
import { integer } from "../../src/validators/integer";
import { makeInput } from "../helpers";

describe("integer", () => {
  const v = integer();

  it("valid for positive integer", () => {
    expect(v.validate(makeInput("42"))).toEqual({ valid: true });
  });

  it("valid for negative integer", () => {
    expect(v.validate(makeInput("-7"))).toEqual({ valid: true });
  });

  it("valid for zero", () => {
    expect(v.validate(makeInput("0"))).toEqual({ valid: true });
  });

  it("invalid for decimal", () => {
    expect(v.validate(makeInput("3.14"))).toEqual({ valid: false });
  });

  it("invalid for letters", () => {
    expect(v.validate(makeInput("abc"))).toEqual({ valid: false });
  });

  it("invalid for empty string", () => {
    expect(v.validate(makeInput(""))).toEqual({ valid: false });
  });
});
