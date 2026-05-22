import { describe, expect, it } from "vitest";
import type { ValidatorInput } from "../../src/core/types";
import { different } from "../../src/validators/different";
import { makeForm } from "../helpers";

describe("different", () => {
  const v = different();

  function makeCompareInput(value: string, compareValue: string): ValidatorInput {
    const form = makeForm({ newPass: value, oldPass: compareValue });
    const el = form.querySelector<HTMLInputElement>('[name="newPass"]')!;
    return {
      value,
      options: { compare: "oldPass" },
      field: "newPass",
      elements: [el],
      form,
    };
  }

  it("valid when values differ", () => {
    expect(v.validate(makeCompareInput("newSecret", "oldSecret"))).toEqual({ valid: true });
  });

  it("invalid when values are the same", () => {
    expect(v.validate(makeCompareInput("same", "same"))).toEqual({ valid: false });
  });
});
