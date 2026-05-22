import { describe, expect, it } from "vitest";
import { between } from "../../src/validators/between";
import { makeInput } from "../helpers";

describe("between", () => {
  const v = between();

  it("valid when value is within range (inclusive by default)", () => {
    expect(v.validate(makeInput("5", { min: 1, max: 10 }))).toEqual({ valid: true });
  });

  it("valid for boundary values (inclusive)", () => {
    expect(v.validate(makeInput("1", { min: 1, max: 10 }))).toEqual({ valid: true });
    expect(v.validate(makeInput("10", { min: 1, max: 10 }))).toEqual({ valid: true });
  });

  it("invalid for out-of-range value", () => {
    expect(v.validate(makeInput("0", { min: 1, max: 10 }))).toEqual({ valid: false });
    expect(v.validate(makeInput("11", { min: 1, max: 10 }))).toEqual({ valid: false });
  });

  it("invalid for boundary when inclusive=false", () => {
    expect(v.validate(makeInput("1", { min: 1, max: 10, inclusive: false }))).toEqual({
      valid: false,
    });
    expect(v.validate(makeInput("10", { min: 1, max: 10, inclusive: false }))).toEqual({
      valid: false,
    });
  });

  it("invalid for non-numeric string", () => {
    expect(v.validate(makeInput("abc", { min: 1, max: 10 }))).toEqual({ valid: false });
  });
});
