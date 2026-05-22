import { describe, expect, it } from "vitest";
import { digits } from "../../src/validators/digits";
import { makeInput } from "../helpers";

describe("digits", () => {
  const v = digits();

  it("valid for digit-only string", () => {
    expect(v.validate(makeInput("12345"))).toEqual({ valid: true });
  });

  it("invalid for string with letters", () => {
    expect(v.validate(makeInput("123a"))).toEqual({ valid: false });
  });

  it("invalid for negative number", () => {
    expect(v.validate(makeInput("-5"))).toEqual({ valid: false });
  });

  it("invalid for decimal", () => {
    expect(v.validate(makeInput("1.5"))).toEqual({ valid: false });
  });

  it("invalid for empty string", () => {
    expect(v.validate(makeInput(""))).toEqual({ valid: false });
  });
});
