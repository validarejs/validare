import { describe, expect, it } from "vitest";
import { blank } from "../../src/validators/blank";
import { makeInput } from "../helpers";

describe("blank", () => {
  const v = blank();

  it("valid for empty string", () => {
    expect(v.validate(makeInput(""))).toEqual({ valid: true });
  });

  it("invalid for non-empty string", () => {
    expect(v.validate(makeInput("hello"))).toEqual({ valid: false });
  });

  it("valid for whitespace-only when trim=true", () => {
    expect(v.validate(makeInput("   ", { trim: true }))).toEqual({ valid: true });
  });

  it("invalid for whitespace-only when trim=false (default)", () => {
    expect(v.validate(makeInput("   "))).toEqual({ valid: false });
  });

  it('invalid for "0"', () => {
    expect(v.validate(makeInput("0"))).toEqual({ valid: false });
  });
});
