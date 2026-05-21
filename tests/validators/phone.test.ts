import { describe, expect, it } from "vitest";
import { phone } from "../../src/validators/phone";

const v = phone();
const inp = (value: string, options: Record<string, unknown> = {}) => ({
  value,
  options,
  field: "",
  elements: [],
  form: null as never,
});

describe("phone", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts when no country option", () => expect(v.validate(inp("abc")).valid).toBe(true));
  it("accepts when unknown country", () =>
    expect(v.validate(inp("123", { country: "XX" })).valid).toBe(true));
  it("accepts valid US phone", () =>
    expect(v.validate(inp("+1 (555) 234-5678", { country: "US" })).valid).toBe(true));
  it("accepts valid US phone without country code", () =>
    expect(v.validate(inp("555-234-5678", { country: "US" })).valid).toBe(true));
  it("rejects invalid US phone", () =>
    expect(v.validate(inp("abc", { country: "US" })).valid).toBe(false));
  it("accepts valid DE phone", () =>
    expect(v.validate(inp("+49 30 12345678", { country: "DE" })).valid).toBe(true));
  it("rejects invalid DE phone", () =>
    expect(v.validate(inp("abc", { country: "DE" })).valid).toBe(false));
  it("accepts valid FR phone", () =>
    expect(v.validate(inp("01 23 45 67 89", { country: "FR" })).valid).toBe(true));
  it("accepts valid GB phone", () =>
    expect(v.validate(inp("020 7946 0958", { country: "GB" })).valid).toBe(true));
});
