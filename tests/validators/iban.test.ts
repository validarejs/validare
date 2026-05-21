import { describe, expect, it } from "vitest";
import { iban } from "../../src/validators/iban";

const v = iban();
const inp = (value: string, options: Record<string, unknown> = {}) => ({
  value,
  options,
  field: "",
  elements: [],
  form: null as never,
});

describe("iban", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid GB IBAN", () =>
    expect(v.validate(inp("GB82WEST12345698765432")).valid).toBe(true));
  it("accepts valid DE IBAN", () =>
    expect(v.validate(inp("DE89370400440532013000")).valid).toBe(true));
  it("accepts valid NL IBAN", () => expect(v.validate(inp("NL91ABNA0417164300")).valid).toBe(true));
  it("accepts IBAN with spaces stripped", () =>
    expect(v.validate(inp("GB82 WEST 1234 5698 7654 32")).valid).toBe(true));
  it("rejects IBAN with wrong check digits", () =>
    expect(v.validate(inp("GB00WEST12345698765432")).valid).toBe(false));
  it("rejects unknown country", () =>
    expect(v.validate(inp("XX82WEST12345698765432")).valid).toBe(false));
  it("accepts IBAN with country option override", () =>
    expect(v.validate(inp("GB82WEST12345698765432", { country: "GB" })).valid).toBe(true));
  it("rejects non-SEPA country when sepa:true", () =>
    expect(v.validate(inp("AO06000600000100037131174", { sepa: true })).valid).toBe(false));
  it("accepts SEPA country when sepa:true", () =>
    expect(v.validate(inp("DE89370400440532013000", { sepa: true })).valid).toBe(true));
  it("rejects SEPA country when sepa:false", () =>
    expect(v.validate(inp("DE89370400440532013000", { sepa: false })).valid).toBe(false));
});
