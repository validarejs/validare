import { afterEach, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { validare } from "../../src";
import { Summary } from "../../src/plugins/core/Summary";

function makeFormWithSummary() {
  const dom = new JSDOM(
    `<html><body>
      <div class="fv-plugins-summary"></div>
      <form id="f">
        <input name="name" value="">
        <input name="email" value="">
      </form>
    </body></html>`,
    { url: "http://localhost" },
  );
  global.document = dom.window.document as unknown as Document;
  global.HTMLElement = dom.window.HTMLElement as unknown as typeof HTMLElement;
  const form = dom.window.document.getElementById("f") as HTMLFormElement;
  return { form, dom };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Summary", () => {
  it("renders error list after failed validation", async () => {
    const { form } = makeFormWithSummary();
    const plugin = new Summary();
    const fv = validare(form, {
      plugins: { summary: plugin },
      fields: {
        name:  { validators: { notEmpty: { message: "Name is required" } } },
        email: { validators: { notEmpty: { message: "Email is required" } } },
      },
    });
    await fv.validate();
    const container = document.querySelector(".fv-plugins-summary");
    expect(container?.innerHTML).toContain("Name is required");
    expect(container?.innerHTML).toContain("Email is required");
  });

  it("clears summary after successful validation", async () => {
    const { form } = makeFormWithSummary();
    const plugin = new Summary();
    const fv = validare(form, {
      plugins: { summary: plugin },
      fields: {
        name: { validators: { notEmpty: { message: "Name is required" } } },
      },
    });
    await fv.validate();
    const container = document.querySelector(".fv-plugins-summary")!;
    expect(container.innerHTML).toContain("Name is required");

    const input = form.querySelector("input") as HTMLInputElement;
    input.value = "Alice";
    fv.reset();
    await fv.validate();
    expect(container.innerHTML).toBe("");
  });

  it("clears summary on reset", async () => {
    const { form } = makeFormWithSummary();
    const plugin = new Summary();
    const fv = validare(form, {
      plugins: { summary: plugin },
      fields: { name: { validators: { notEmpty: { message: "Name is required" } } } },
    });
    await fv.validate();
    fv.reset();
    const container = document.querySelector(".fv-plugins-summary");
    expect(container?.innerHTML).toBe("");
  });

  it("uses custom renderTitle", async () => {
    const { form } = makeFormWithSummary();
    const plugin = new Summary({ renderTitle: () => "Errors found:" });
    const fv = validare(form, {
      plugins: { summary: plugin },
      fields: { name: { validators: { notEmpty: { message: "Name is required" } } } },
    });
    await fv.validate();
    const container = document.querySelector(".fv-plugins-summary");
    expect(container?.innerHTML).toContain("Errors found:");
  });

  it("uses custom renderItem", async () => {
    const { form } = makeFormWithSummary();
    const plugin = new Summary({
      renderItem: (field, msg) => `[${field}] ${msg}`,
    });
    const fv = validare(form, {
      plugins: { summary: plugin },
      fields: { name: { validators: { notEmpty: { message: "Name is required" } } } },
    });
    await fv.validate();
    const container = document.querySelector(".fv-plugins-summary");
    expect(container?.innerHTML).toContain("[name] Name is required");
  });

  it("omits title when renderTitle returns empty string", async () => {
    const { form } = makeFormWithSummary();
    const plugin = new Summary({ renderTitle: () => "" });
    const fv = validare(form, {
      plugins: { summary: plugin },
      fields: { name: { validators: { notEmpty: { message: "Name is required" } } } },
    });
    await fv.validate();
    const container = document.querySelector(".fv-plugins-summary");
    expect(container?.innerHTML).not.toContain("<p>");
    expect(container?.innerHTML).toContain("Name is required");
  });

  it("clears container on uninstall", async () => {
    const { form } = makeFormWithSummary();
    const plugin = new Summary();
    const fv = validare(form, {
      plugins: { summary: plugin },
      fields: { name: { validators: { notEmpty: { message: "Name is required" } } } },
    });
    await fv.validate();
    fv.destroy();
    const container = document.querySelector(".fv-plugins-summary");
    expect(container?.innerHTML).toBe("");
  });
});
