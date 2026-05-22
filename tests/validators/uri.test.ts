import { describe, expect, it } from "vitest";
import { uri } from "../../src/validators/uri";
import { makeInput } from "../helpers";

describe("uri", () => {
  const v = uri();

  it("valid for http URL", () => {
    expect(v.validate(makeInput("http://example.com"))).toEqual({ valid: true });
  });

  it("valid for https URL with path", () => {
    expect(v.validate(makeInput("https://example.com/path?q=1#hash"))).toEqual({ valid: true });
  });

  it("invalid for string without protocol", () => {
    expect(v.validate(makeInput("example.com"))).toEqual({ valid: false });
  });

  it("invalid for empty string", () => {
    expect(v.validate(makeInput(""))).toEqual({ valid: false });
  });

  it("invalid for random string", () => {
    expect(v.validate(makeInput("not a url"))).toEqual({ valid: false });
  });
});
