import { describe, expect, it } from "vitest";
import { imo } from "../../src/validators/imo";

const v = imo();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("imo", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid IMO number", () => expect(v.validate(inp("IMO 9074729")).valid).toBe(true));
  it("accepts lowercase imo prefix", () => expect(v.validate(inp("imo 9074729")).valid).toBe(true));
  it("rejects wrong check digit", () => expect(v.validate(inp("IMO 9074720")).valid).toBe(false));
  it("rejects missing IMO prefix", () => expect(v.validate(inp("9074729")).valid).toBe(false));
  it("rejects wrong format", () => expect(v.validate(inp("IMO9074729")).valid).toBe(false));
});
