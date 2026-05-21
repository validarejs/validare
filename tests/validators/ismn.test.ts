import { describe, expect, it } from "vitest";
import { ismn } from "../../src/validators/ismn";

const v = ismn();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("ismn", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  // ISMN-10
  it("accepts valid ISMN-10 without separators", () =>
    expect(v.validate(inp("M230671187")).valid).toBe(true));
  it("accepts valid ISMN-10 with hyphens", () =>
    expect(v.validate(inp("M-2306-7118-7")).valid).toBe(true));
  it("accepts valid ISMN-10 with spaces", () =>
    expect(v.validate(inp("M 2306 7118 7")).valid).toBe(true));
  // ISMN-13
  it("accepts valid ISMN-13 digits only", () =>
    expect(v.validate(inp("9790230671187")).valid).toBe(true));
  it("accepts valid ISMN-13 with hyphens", () =>
    expect(v.validate(inp("979-0-2306-7118-7")).valid).toBe(true));
  it("rejects ISMN-13 with wrong check digit", () =>
    expect(v.validate(inp("9790230671180")).valid).toBe(false));
  it("rejects invalid format", () => expect(v.validate(inp("invalid")).valid).toBe(false));
});
