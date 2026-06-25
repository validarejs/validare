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

  describe("with time (24h)", () => {
    it("valid for MM/DD/YYYY HH:mm", () => {
      expect(v.validate(makeInput("12/25/2023 14:30", { format: "MM/DD/YYYY HH:mm" }))).toEqual({ valid: true });
    });

    it("valid for YYYY-MM-DD HH:mm:ss", () => {
      expect(v.validate(makeInput("2023-12-25 14:30:59", { format: "YYYY-MM-DD HH:mm:ss" }))).toEqual({ valid: true });
    });

    it("valid for midnight (00:00)", () => {
      expect(v.validate(makeInput("12/25/2023 00:00", { format: "MM/DD/YYYY HH:mm" }))).toEqual({ valid: true });
    });

    it("valid for end of day (23:59)", () => {
      expect(v.validate(makeInput("12/25/2023 23:59", { format: "MM/DD/YYYY HH:mm" }))).toEqual({ valid: true });
    });

    it("invalid for hour out of range (HH=25)", () => {
      expect(v.validate(makeInput("12/25/2023 25:30", { format: "MM/DD/YYYY HH:mm" }))).toEqual({ valid: false });
    });

    it("invalid for minutes out of range (mm=61)", () => {
      expect(v.validate(makeInput("12/25/2023 14:61", { format: "MM/DD/YYYY HH:mm" }))).toEqual({ valid: false });
    });

    it("invalid for seconds out of range (ss=60)", () => {
      expect(v.validate(makeInput("2023-12-25 14:30:60", { format: "YYYY-MM-DD HH:mm:ss" }))).toEqual({ valid: false });
    });
  });

  describe("with time (12h AM/PM)", () => {
    it("valid for hh:mm AM", () => {
      expect(v.validate(makeInput("12/25/2023 02:30 AM", { format: "MM/DD/YYYY hh:mm A" }))).toEqual({ valid: true });
    });

    it("valid for hh:mm PM", () => {
      expect(v.validate(makeInput("12/25/2023 02:30 PM", { format: "MM/DD/YYYY hh:mm A" }))).toEqual({ valid: true });
    });

    it("valid for 12:00 PM (noon)", () => {
      expect(v.validate(makeInput("12/25/2023 12:00 PM", { format: "MM/DD/YYYY hh:mm A" }))).toEqual({ valid: true });
    });

    it("valid for 12:00 AM (midnight)", () => {
      expect(v.validate(makeInput("12/25/2023 12:00 AM", { format: "MM/DD/YYYY hh:mm A" }))).toEqual({ valid: true });
    });

    it("invalid when AM/PM is missing", () => {
      expect(v.validate(makeInput("12/25/2023 02:30", { format: "MM/DD/YYYY hh:mm A" }))).toEqual({ valid: false });
    });
  });
});
