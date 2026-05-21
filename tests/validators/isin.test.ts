import { describe, it, expect } from "vitest";
import { isin } from "../../src/validators/isin";

const v = isin();
const inp = (value: string) =>
  ({ value, options: {}, field: "", elements: [], form: null as never });

describe("isin", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid US ISIN", () => expect(v.validate(inp("US0378331005")).valid).toBe(true));
  it("accepts valid GB ISIN", () => expect(v.validate(inp("GB0002634946")).valid).toBe(true));
  it("rejects wrong check digit", () => expect(v.validate(inp("US0378331006")).valid).toBe(false));
  it("rejects invalid country code", () => expect(v.validate(inp("XX0378331005")).valid).toBe(false));
  it("rejects wrong length", () => expect(v.validate(inp("US037833100")).valid).toBe(false));
});
