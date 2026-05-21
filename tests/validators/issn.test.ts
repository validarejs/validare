import { describe, expect, it } from "vitest";
import { issn } from "../../src/validators/issn";

const v = issn();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("issn", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid ISSN", () => expect(v.validate(inp("0378-5955")).valid).toBe(true));
  it("accepts ISSN with X check digit", () =>
    expect(v.validate(inp("0000-006X")).valid).toBe(true));
  it("rejects wrong format", () => expect(v.validate(inp("12345678")).valid).toBe(false));
  it("rejects wrong check digit", () => expect(v.validate(inp("0378-5956")).valid).toBe(false));
});
