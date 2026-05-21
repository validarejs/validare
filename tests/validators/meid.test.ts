import { describe, expect, it } from "vitest";
import { meid } from "../../src/validators/meid";

const v = meid();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("meid", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  // Hex MEID with check digit (15 hex chars)
  it("accepts valid hex MEID 15 chars (known valid)", () =>
    expect(v.validate(inp("AF0123450ABCDE0")).valid).toBe(true));
  it("rejects hex MEID 15 chars with wrong check", () =>
    expect(v.validate(inp("AF0123450ABCDE1")).valid).toBe(false));
  // Hex MEID without check digit (14 hex chars) — always valid
  it("accepts hex MEID 14 chars (no check digit)", () =>
    expect(v.validate(inp("AF0123450ABCDE")).valid).toBe(true));
  // Decimal MEID with check digit (19 digits)
  it("accepts valid decimal MEID 19 digits", () =>
    expect(v.validate(inp("2936780777509488773")).valid).toBe(true));
  // Decimal MEID without check digit (18 digits) — always valid
  it("accepts decimal MEID 18 digits (no check digit)", () =>
    expect(v.validate(inp("293678077750948877")).valid).toBe(true));
  // Invalid
  it("rejects random string", () => expect(v.validate(inp("notameid")).valid).toBe(false));
  it("rejects wrong length (13 hex)", () =>
    expect(v.validate(inp("AF0123450ABCD")).valid).toBe(false));
});
