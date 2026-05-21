import { describe, expect, it } from "vitest";
import { siret } from "../../src/validators/siret";

const v = siret();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("siret", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid SIRET", () => expect(v.validate(inp("55210055300007")).valid).toBe(true));
  it("accepts another valid SIRET", () =>
    expect(v.validate(inp("73282932000074")).valid).toBe(true));
  it("rejects SIRET with wrong check digit", () =>
    expect(v.validate(inp("55210055300008")).valid).toBe(false));
  it("rejects wrong length", () => expect(v.validate(inp("5521005530005")).valid).toBe(false));
  it("rejects non-digit chars", () => expect(v.validate(inp("5521005530005A")).valid).toBe(false));
});
