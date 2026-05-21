import { describe, expect, it } from "vitest";
import { imei } from "../../src/validators/imei";

const v = imei();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("imei", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid 15-digit IMEI", () =>
    expect(v.validate(inp("490154203237518")).valid).toBe(true));
  it("accepts valid IMEI with hyphens", () =>
    expect(v.validate(inp("49-015420-323751-8")).valid).toBe(true));
  it("accepts valid IMEI with spaces", () =>
    expect(v.validate(inp("49 015420 323751 8")).valid).toBe(true));
  it("accepts 14-digit IMEI (no check digit)", () =>
    expect(v.validate(inp("49015420323751")).valid).toBe(true));
  it("rejects IMEI with wrong Luhn check digit", () =>
    expect(v.validate(inp("490154203237519")).valid).toBe(false));
  it("rejects too short", () => expect(v.validate(inp("12345678")).valid).toBe(false));
});
