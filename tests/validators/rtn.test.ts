import { describe, expect, it } from "vitest";
import { rtn } from "../../src/validators/rtn";

const v = rtn();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("rtn", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid RTN", () => expect(v.validate(inp("021000021")).valid).toBe(true));
  it("accepts another valid RTN", () => expect(v.validate(inp("011000015")).valid).toBe(true));
  it("rejects RTN with wrong checksum", () =>
    expect(v.validate(inp("021000022")).valid).toBe(false));
  it("rejects non-digit chars", () => expect(v.validate(inp("02100002A")).valid).toBe(false));
  it("rejects wrong length", () => expect(v.validate(inp("12345678")).valid).toBe(false));
});
