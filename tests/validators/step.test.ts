import { describe, expect, it } from "vitest";
import { step } from "../../src/validators/step";

const input = (value: string, opts: Record<string, unknown> = {}) => ({
  value,
  options: opts,
  field: "",
  elements: [],
  form: null as never,
});

describe("step", () => {
  it("accepts empty string", () => expect(step().validate(input("")).valid).toBe(true));
  it("accepts value that is a multiple of step=2", () =>
    expect(step().validate(input("6", { step: 2 })).valid).toBe(true));
  it("accepts value matching baseValue+step=0.1", () =>
    expect(step().validate(input("0.3", { step: 0.1, baseValue: 0 })).valid).toBe(true));
  it("rejects value not a multiple of step=2", () =>
    expect(step().validate(input("3", { step: 2 })).valid).toBe(false));
  it("rejects non-numeric value", () =>
    expect(step().validate(input("abc", { step: 1 })).valid).toBe(false));
  it("accepts default step=1 with integer", () =>
    expect(step().validate(input("5")).valid).toBe(true));
  it("rejects 1.5 with default step=1", () =>
    expect(step().validate(input("1.5")).valid).toBe(false));
});
