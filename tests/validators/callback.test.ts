import { describe, expect, it } from "vitest";
import type { ValidatorInput, ValidatorResult } from "../../src/core/types";
import { callback } from "../../src/validators/callback";
import { makeInput } from "../helpers";

describe("callback", () => {
  const v = callback();

  it("returns result from callback function", () => {
    const input = makeInput("test", {
      callback: (i: ValidatorInput): ValidatorResult => ({ valid: i.value.length > 2 }),
    });
    expect(v.validate(input)).toEqual({ valid: true });
  });

  it("returns invalid when callback returns false", () => {
    const input = makeInput("a", {
      callback: (_i: ValidatorInput): ValidatorResult => ({ valid: false, message: "Too short" }),
    });
    expect(v.validate(input)).toEqual({ valid: false, message: "Too short" });
  });
});
