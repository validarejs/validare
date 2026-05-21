import { describe, expect, it } from "vitest";
import { siren } from "../../src/validators/siren";

const v = siren();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("siren", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid SIREN", () => expect(v.validate(inp("552100554")).valid).toBe(true));
  it("accepts another valid SIREN", () => expect(v.validate(inp("732829320")).valid).toBe(true));
  it("rejects SIREN with wrong Luhn check", () =>
    expect(v.validate(inp("552100555")).valid).toBe(false));
  it("rejects wrong length", () => expect(v.validate(inp("55210055")).valid).toBe(false));
  it("rejects non-digit chars", () => expect(v.validate(inp("55210055A")).valid).toBe(false));
});
