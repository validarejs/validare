import { describe, expect, it } from "vitest";
import { mac } from "../../src/validators/mac";

describe("mac", () => {
  const v = mac();
  it("accepts empty string", () =>
    expect(
      v.validate({ value: "", options: {}, field: "", elements: [], form: null as never }).valid,
    ).toBe(true));
  it("accepts colon format", () =>
    expect(
      v.validate({
        value: "00:1A:2B:3C:4D:5E",
        options: {},
        field: "",
        elements: [],
        form: null as never,
      }).valid,
    ).toBe(true));
  it("accepts hyphen format", () =>
    expect(
      v.validate({
        value: "00-1A-2B-3C-4D-5E",
        options: {},
        field: "",
        elements: [],
        form: null as never,
      }).valid,
    ).toBe(true));
  it("accepts dot format", () =>
    expect(
      v.validate({
        value: "001A.2B3C.4D5E",
        options: {},
        field: "",
        elements: [],
        form: null as never,
      }).valid,
    ).toBe(true));
  it("rejects invalid MAC", () =>
    expect(
      v.validate({
        value: "ZZ:ZZ:ZZ:ZZ:ZZ:ZZ",
        options: {},
        field: "",
        elements: [],
        form: null as never,
      }).valid,
    ).toBe(false));
});
