import { describe, expect, it } from "vitest";
import { ein } from "../../src/validators/ein";

const v = ein();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("ein", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid EIN (Brookhaven prefix 01)", () =>
    expect(v.validate(inp("01-1234567")).valid).toBe(true));
  it("accepts valid EIN (Andover prefix 10)", () =>
    expect(v.validate(inp("10-1234567")).valid).toBe(true));
  it("accepts valid EIN without hyphen", () =>
    expect(v.validate(inp("011234567")).valid).toBe(true));
  it("rejects invalid campus prefix 00", () =>
    expect(v.validate(inp("00-1234567")).valid).toBe(false));
  it("rejects invalid campus prefix 07", () =>
    expect(v.validate(inp("07-1234567")).valid).toBe(false));
  it("rejects wrong format", () => expect(v.validate(inp("1-1234567")).valid).toBe(false));
});
