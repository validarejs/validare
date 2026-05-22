import { describe, expect, it } from "vitest";
import type { ValidatorInput, ValidatorResult } from "../../src/core/types";
import { promise } from "../../src/validators/promise";
import { makeInput } from "../helpers";

describe("promise", () => {
  const v = promise();

  it("resolves to valid result", async () => {
    const input = makeInput("test", {
      promise: async (_i: ValidatorInput): Promise<ValidatorResult> => ({ valid: true }),
    });
    await expect(v.validate(input)).resolves.toEqual({ valid: true });
  });

  it("resolves to invalid result", async () => {
    const input = makeInput("test", {
      promise: async (_i: ValidatorInput): Promise<ValidatorResult> => ({
        valid: false,
        message: "Async failure",
      }),
    });
    await expect(v.validate(input)).resolves.toEqual({ valid: false, message: "Async failure" });
  });
});
