import { describe, expect, it } from "vitest";
import { numeric } from "../../src/validators/numeric";
import { makeInput } from "../helpers";

describe("numeric", () => {
  const v = numeric();

  it("valid for integer string", () => {
    expect(v.validate(makeInput("42"))).toEqual({ valid: true });
  });

  it("valid for decimal", () => {
    expect(v.validate(makeInput("3.14"))).toEqual({ valid: true });
  });

  it("valid for negative decimal", () => {
    expect(v.validate(makeInput("-1.5"))).toEqual({ valid: true });
  });

  it("invalid for letters", () => {
    expect(v.validate(makeInput("abc"))).toEqual({ valid: false });
  });

  it("supports custom decimal separator", () => {
    expect(v.validate(makeInput("3,14", { decimalSeparator: "," }))).toEqual({ valid: true });
  });

  it("supports thousands separator", () => {
    expect(
      v.validate(makeInput("1.000,50", { thousandsSeparator: ".", decimalSeparator: "," })),
    ).toEqual({ valid: true });
  });
});
