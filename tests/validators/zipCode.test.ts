import { describe, expect, it } from "vitest";
import { zipCode } from "../../src/validators/zipCode";

const v = zipCode();
const inp = (value: string, options: Record<string, unknown> = {}) => ({
  value,
  options,
  field: "",
  elements: [],
  form: null as never,
});

describe("zipCode", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts when no country option", () => expect(v.validate(inp("INVALID")).valid).toBe(true));
  it("accepts when unknown country", () =>
    expect(v.validate(inp("123", { country: "XX" })).valid).toBe(true));
  it("accepts valid US zip", () =>
    expect(v.validate(inp("12345", { country: "US" })).valid).toBe(true));
  it("accepts valid US zip+4", () =>
    expect(v.validate(inp("12345-6789", { country: "US" })).valid).toBe(true));
  it("rejects invalid US zip", () =>
    expect(v.validate(inp("1234A", { country: "US" })).valid).toBe(false));
  it("accepts valid DE zip", () =>
    expect(v.validate(inp("10115", { country: "DE" })).valid).toBe(true));
  it("accepts valid FR zip", () =>
    expect(v.validate(inp("75001", { country: "FR" })).valid).toBe(true));
  it("accepts valid CA postal code", () =>
    expect(v.validate(inp("M5V 3L9", { country: "CA" })).valid).toBe(true));
  it("accepts valid GB postcode SW1A 1AA", () =>
    expect(v.validate(inp("SW1A 1AA", { country: "GB" })).valid).toBe(true));
  it("accepts valid GB postcode W1A 0AX", () =>
    expect(v.validate(inp("W1A 0AX", { country: "GB" })).valid).toBe(true));
  it("rejects invalid GB postcode", () =>
    expect(v.validate(inp("INVALID", { country: "GB" })).valid).toBe(false));
  it("accepts valid BR zip", () =>
    expect(v.validate(inp("01310-100", { country: "BR" })).valid).toBe(true));
});
