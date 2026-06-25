import { describe, expect, it } from "vitest";
import { creditCard } from "../../src/validators/creditCard";
import { makeInput } from "../helpers";

describe("creditCard", () => {
  const v = creditCard();

  it("valid for known-valid Visa test number", () => {
    expect(v.validate(makeInput("4111111111111111"))).toEqual({ valid: true, meta: { type: "visa" } });
  });

  it("valid for known-valid Mastercard test number", () => {
    expect(v.validate(makeInput("5500005555555559"))).toEqual({ valid: true, meta: { type: "mastercard" } });
  });

  it("valid for known-valid Amex test number", () => {
    expect(v.validate(makeInput("378282246310005"))).toEqual({ valid: true, meta: { type: "amex" } });
  });

  it("valid for known-valid Discover test number", () => {
    expect(v.validate(makeInput("6011111111111117"))).toEqual({ valid: true, meta: { type: "discover" } });
  });

  it("valid for known-valid Diners Club test number", () => {
    expect(v.validate(makeInput("30569309025904"))).toEqual({ valid: true, meta: { type: "dinersclub" } });
  });

  it("valid for known-valid JCB test number", () => {
    expect(v.validate(makeInput("3530111333300000"))).toEqual({ valid: true, meta: { type: "jcb" } });
  });

  it("valid for number with spaces", () => {
    expect(v.validate(makeInput("4111 1111 1111 1111"))).toEqual({ valid: true, meta: { type: "visa" } });
  });

  it("valid for number with dashes", () => {
    expect(v.validate(makeInput("4111-1111-1111-1111"))).toEqual({ valid: true, meta: { type: "visa" } });
  });

  it("invalid for number that fails Luhn check", () => {
    expect(v.validate(makeInput("4111111111111112"))).toEqual({ valid: false });
  });

  it("invalid for non-numeric input", () => {
    expect(v.validate(makeInput("abc"))).toEqual({ valid: false });
  });

  it("invalid for empty string", () => {
    expect(v.validate(makeInput(""))).toEqual({ valid: false });
  });
});
