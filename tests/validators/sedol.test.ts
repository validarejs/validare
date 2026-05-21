import { describe, expect, it } from "vitest";
import { sedol } from "../../src/validators/sedol";

const v = sedol();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("sedol", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid SEDOL", () => expect(v.validate(inp("0263494")).valid).toBe(true));
  it("accepts valid SEDOL with letters", () => expect(v.validate(inp("B0YBKJ7")).valid).toBe(true));
  it("rejects wrong check digit", () => expect(v.validate(inp("0263490")).valid).toBe(false));
  it("rejects wrong length", () => expect(v.validate(inp("02634")).valid).toBe(false));
  it("rejects invalid chars (vowels not allowed)", () =>
    expect(v.validate(inp("AXXXXXX")).valid).toBe(false));
});
