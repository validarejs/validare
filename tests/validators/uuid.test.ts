import { describe, expect, it } from "vitest";
import { uuid } from "../../src/validators/uuid";

const input = (value: string, version?: number) => ({
  value,
  options: version ? { version } : {},
  field: "",
  elements: [],
  form: null as never,
});

describe("uuid", () => {
  it("accepts empty string", () => expect(uuid().validate(input("")).valid).toBe(true));
  it("accepts valid v4 UUID (any)", () =>
    expect(uuid().validate(input("550e8400-e29b-41d4-a716-446655440000")).valid).toBe(true));
  it("accepts v4 UUID when version=4 specified", () =>
    expect(uuid().validate(input("550e8400-e29b-41d4-a716-446655440000", 4)).valid).toBe(true));
  it("accepts v3 UUID when version=3", () =>
    expect(uuid().validate(input("a0eebc99-9c0b-32ef-bc09-9e7e6c8bd8a7", 3)).valid).toBe(true));
  it("accepts v5 UUID when version=5", () =>
    expect(uuid().validate(input("886313e1-3b8a-5372-9b90-0c9aee199e5d", 5)).valid).toBe(true));
  it("rejects wrong version", () =>
    expect(uuid().validate(input("550e8400-e29b-41d4-a716-446655440000", 3)).valid).toBe(false));
  it("rejects invalid UUID format", () =>
    expect(uuid().validate(input("not-a-uuid")).valid).toBe(false));
  it("rejects UUID with wrong segment lengths", () =>
    expect(uuid().validate(input("550e8400-e29b-41d4-a716")).valid).toBe(false));
});
