import { describe, expect, it } from "vitest";
import type { ValidatorInput } from "../../src/core/types";
import { file } from "../../src/validators/file";

function makeFileInput(
  files: Array<{ name: string; size: number; type: string }>,
  opts: Record<string, unknown> = {},
): ValidatorInput {
  const form = document.createElement("form");
  const el = document.createElement("input");
  el.type = "file";
  el.name = "upload";
  form.appendChild(el);

  // jsdom doesn't support FileList assignment, mock it
  const fileList = {
    length: files.length,
    item: (i: number) => files[i] as unknown as File,
    [Symbol.iterator]: function* () {
      yield* files as unknown as File[];
    },
  };
  for (let i = 0; i < files.length; i++) {
    Object.defineProperty(fileList, i, { value: files[i] });
  }
  Object.defineProperty(el, "files", { value: fileList });

  return { value: "", options: opts, field: "upload", elements: [el], form };
}

describe("file", () => {
  const v = file();

  it("valid when extension matches", () => {
    const input = makeFileInput([{ name: "photo.jpg", size: 100, type: "image/jpeg" }], {
      extension: "jpg,png",
    });
    expect(v.validate(input)).toEqual({ valid: true });
  });

  it("invalid when extension does not match", () => {
    const input = makeFileInput([{ name: "doc.pdf", size: 100, type: "application/pdf" }], {
      extension: "jpg,png",
    });
    expect(v.validate(input)).toEqual({ valid: false });
  });

  it("invalid when file exceeds maxSize", () => {
    const input = makeFileInput([{ name: "big.jpg", size: 5_000_001, type: "image/jpeg" }], {
      maxSize: 5_000_000,
    });
    expect(v.validate(input)).toEqual({ valid: false });
  });

  it("valid when file is within maxSize", () => {
    const input = makeFileInput([{ name: "small.jpg", size: 100, type: "image/jpeg" }], {
      maxSize: 5_000_000,
    });
    expect(v.validate(input)).toEqual({ valid: true });
  });

  it("valid when no files selected (empty handled by notEmpty)", () => {
    const form = document.createElement("form");
    const el = document.createElement("input");
    el.type = "file";
    Object.defineProperty(el, "files", { value: { length: 0 } });
    form.appendChild(el);
    const input: ValidatorInput = { value: "", options: {}, field: "upload", elements: [el], form };
    expect(v.validate(input)).toEqual({ valid: true });
  });
});
