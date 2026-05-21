import { describe, expect, it } from "vitest";
import { cusip } from "../../src/validators/cusip";

const v = cusip();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("cusip", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid CUSIP digits only", () =>
    expect(v.validate(inp("037833100")).valid).toBe(true));
  it("accepts valid CUSIP with letters", () =>
    expect(v.validate(inp("38259P508")).valid).toBe(true));
  it("rejects wrong check digit", () => expect(v.validate(inp("037833101")).valid).toBe(false));
  it("rejects containing I (not allowed)", () =>
    expect(v.validate(inp("03783310I")).valid).toBe(false));
  it("rejects wrong length", () => expect(v.validate(inp("0378331")).valid).toBe(false));
});
