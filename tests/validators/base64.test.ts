import { describe, expect, it } from "vitest";
import { base64 } from "../../src/validators/base64";

describe("base64", () => {
  const v = base64();
  it("accepts empty string", () =>
    expect(
      v.validate({ value: "", options: {}, field: "", elements: [], form: null as never }),
    ).toEqual({ valid: true }));
  it("accepts valid base64", () =>
    expect(
      v.validate({
        value: "SGVsbG8gV29ybGQ=",
        options: {},
        field: "",
        elements: [],
        form: null as never,
      }).valid,
    ).toBe(true));
  it("accepts padded base64", () =>
    expect(
      v.validate({ value: "dGVzdA==", options: {}, field: "", elements: [], form: null as never })
        .valid,
    ).toBe(true));
  it("rejects invalid base64", () =>
    expect(
      v.validate({ value: "not-valid!", options: {}, field: "", elements: [], form: null as never })
        .valid,
    ).toBe(false));
  it("rejects base64 with wrong padding", () =>
    expect(
      v.validate({
        value: "SGVsbG8=extra",
        options: {},
        field: "",
        elements: [],
        form: null as never,
      }).valid,
    ).toBe(false));
});
