import { describe, expect, it } from "vitest";
import { grid } from "../../src/validators/grid";

const v = grid();
const inp = (value: string) => ({
  value,
  options: {},
  field: "",
  elements: [],
  form: null as never,
});

describe("grid", () => {
  it("accepts empty string", () => expect(v.validate(inp("")).valid).toBe(true));
  it("accepts valid GRId without prefix", () =>
    expect(v.validate(inp("A12425GABC1234002M")).valid).toBe(true));
  it("accepts valid GRId with GRID: prefix", () =>
    expect(v.validate(inp("GRID:A12425GABC1234002M")).valid).toBe(true));
  it("accepts valid GRId with hyphens", () =>
    expect(v.validate(inp("A1-2425G-ABC1234002-M")).valid).toBe(true));
  it("accepts valid GRId with spaces", () =>
    expect(v.validate(inp("A1 2425G ABC1234002 M")).valid).toBe(true));
  it("rejects wrong check character", () =>
    expect(v.validate(inp("A12425GABC1234002N")).valid).toBe(false));
  it("rejects too short", () => expect(v.validate(inp("A12425GABC123400")).valid).toBe(false));
});
