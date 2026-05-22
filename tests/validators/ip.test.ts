import { describe, expect, it } from "vitest";
import { ip } from "../../src/validators/ip";
import { makeInput } from "../helpers";

describe("ip", () => {
  const v = ip();

  it("valid for IPv4", () => {
    expect(v.validate(makeInput("192.168.1.1"))).toEqual({ valid: true });
  });

  it("valid for IPv4 boundary values", () => {
    expect(v.validate(makeInput("0.0.0.0"))).toEqual({ valid: true });
    expect(v.validate(makeInput("255.255.255.255"))).toEqual({ valid: true });
  });

  it("invalid for out-of-range IPv4", () => {
    expect(v.validate(makeInput("256.0.0.1"))).toEqual({ valid: false });
  });

  it("valid for full IPv6", () => {
    expect(v.validate(makeInput("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))).toEqual({
      valid: true,
    });
  });

  it("invalid for empty", () => {
    expect(v.validate(makeInput(""))).toEqual({ valid: false });
  });

  it("ipv4=false rejects IPv4", () => {
    expect(v.validate(makeInput("192.168.1.1", { ipv4: false }))).toEqual({ valid: false });
  });

  it("ipv6=false rejects IPv6", () => {
    expect(
      v.validate(makeInput("2001:0db8:85a3:0000:0000:8a2e:0370:7334", { ipv6: false })),
    ).toEqual({ valid: false });
  });
});
