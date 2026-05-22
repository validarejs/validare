import { describe, expect, it } from "vitest";
import { lessThan } from "../../src/validators/lessThan";
import { makeInput } from "../helpers";

describe("lessThan", () => {
  const v = lessThan();

  it("valid when less than max (inclusive)", () => {
    expect(v.validate(makeInput("2", { max: 5 }))).toEqual({ valid: true });
  });

  it("valid for equal to max (inclusive by default)", () => {
    expect(v.validate(makeInput("5", { max: 5 }))).toEqual({ valid: true });
  });

  it("invalid for greater than max", () => {
    expect(v.validate(makeInput("6", { max: 5 }))).toEqual({ valid: false });
  });

  it("invalid for equal to max when inclusive=false", () => {
    expect(v.validate(makeInput("5", { max: 5, inclusive: false }))).toEqual({ valid: false });
  });

  it("invalid for non-numeric", () => {
    expect(v.validate(makeInput("abc", { max: 5 }))).toEqual({ valid: false });
  });
});
