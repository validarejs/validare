import { describe, expect, it } from "vitest";
import { date } from "../../src/validators/date";
import { makeInput } from "../helpers";

describe("date", () => {
  const v = date();

  it("valid for MM/DD/YYYY (default format)", () => {
    expect(v.validate(makeInput("12/25/2023"))).toEqual({ valid: true });
  });

  it("valid for YYYY-MM-DD format", () => {
    expect(v.validate(makeInput("2023-12-25", { format: "YYYY-MM-DD" }))).toEqual({ valid: true });
  });

  it("valid for DD/MM/YYYY format", () => {
    expect(v.validate(makeInput("25/12/2023", { format: "DD/MM/YYYY" }))).toEqual({ valid: true });
  });

  it("invalid for non-existent date (Feb 30)", () => {
    expect(v.validate(makeInput("02/30/2023"))).toEqual({ valid: false });
  });

  it("invalid for wrong format", () => {
    expect(v.validate(makeInput("2023-12-25"))).toEqual({ valid: false });
  });

  it("invalid for empty string", () => {
    expect(v.validate(makeInput(""))).toEqual({ valid: false });
  });

  it("invalid for letters", () => {
    expect(v.validate(makeInput("not-a-date"))).toEqual({ valid: false });
  });

  it("valid for leap day on leap year", () => {
    expect(v.validate(makeInput("02/29/2024"))).toEqual({ valid: true });
  });

  it("invalid for leap day on non-leap year", () => {
    expect(v.validate(makeInput("02/29/2023"))).toEqual({ valid: false });
  });
});
