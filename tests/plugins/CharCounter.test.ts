import { afterEach, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { validare } from "../../src";
import { CharCounter } from "../../src/plugins/core/CharCounter";

function makeFormWithCounter(value = "") {
  const dom = new JSDOM(
    `<html><body>
      <form id="f">
        <div class="field">
          <input name="bio" value="${value}">
          <span class="fv-plugins-char-counter"></span>
        </div>
      </form>
    </body></html>`,
    { url: "http://localhost" },
  );
  global.document = dom.window.document as unknown as Document;
  global.HTMLElement = dom.window.HTMLElement as unknown as typeof HTMLElement;
  global.Event = dom.window.Event as unknown as typeof Event;
  const form = dom.window.document.getElementById("f") as HTMLFormElement;
  return { dom, form };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("CharCounter", () => {
  it("renders initial count on install", () => {
    const { form } = makeFormWithCounter("hello");
    const plugin = new CharCounter();
    validare(form, {
      plugins: { charCounter: plugin },
      fields: { bio: { validators: { stringLength: { max: 20 } } } },
    });
    const counter = form.querySelector(".fv-plugins-char-counter");
    expect(counter?.textContent).toBe("5 / 20");
  });

  it("updates count on input event", () => {
    const { dom, form } = makeFormWithCounter("");
    const plugin = new CharCounter();
    validare(form, {
      plugins: { charCounter: plugin },
      fields: { bio: { validators: { stringLength: { max: 20 } } } },
    });
    const input = form.querySelector("input") as HTMLInputElement;
    input.value = "hello world";
    input.dispatchEvent(new dom.window.Event("input"));
    const counter = form.querySelector(".fv-plugins-char-counter");
    expect(counter?.textContent).toBe("11 / 20");
  });

  it("adds exceeded class when over max", () => {
    const { dom, form } = makeFormWithCounter("");
    const plugin = new CharCounter();
    validare(form, {
      plugins: { charCounter: plugin },
      fields: { bio: { validators: { stringLength: { max: 5 } } } },
    });
    const input = form.querySelector("input") as HTMLInputElement;
    input.value = "toolongvalue";
    input.dispatchEvent(new dom.window.Event("input"));
    const counter = form.querySelector(".fv-plugins-char-counter");
    expect(counter?.classList.contains("fv-plugins-char-counter--exceeded")).toBe(true);
  });

  it("removes exceeded class when back within max", () => {
    const { dom, form } = makeFormWithCounter("toolong");
    const plugin = new CharCounter();
    validare(form, {
      plugins: { charCounter: plugin },
      fields: { bio: { validators: { stringLength: { max: 5 } } } },
    });
    const input = form.querySelector("input") as HTMLInputElement;
    input.value = "hi";
    input.dispatchEvent(new dom.window.Event("input"));
    const counter = form.querySelector(".fv-plugins-char-counter");
    expect(counter?.classList.contains("fv-plugins-char-counter--exceeded")).toBe(false);
  });

  it("uses custom renderCount function", () => {
    const { form } = makeFormWithCounter("hi");
    const plugin = new CharCounter({
      renderCount: (current, max) => `${max - current} left`,
    });
    validare(form, {
      plugins: { charCounter: plugin },
      fields: { bio: { validators: { stringLength: { max: 10 } } } },
    });
    const counter = form.querySelector(".fv-plugins-char-counter");
    expect(counter?.textContent).toBe("8 left");
  });

  it("ignores fields without stringLength max", () => {
    const { form } = makeFormWithCounter("");
    const plugin = new CharCounter();
    validare(form, {
      plugins: { charCounter: plugin },
      fields: { bio: { validators: { notEmpty: {} } } },
    });
    const counter = form.querySelector(".fv-plugins-char-counter");
    expect(counter?.textContent).toBe("");
  });

  it("clears counter on uninstall", () => {
    const { form } = makeFormWithCounter("hello");
    const plugin = new CharCounter();
    const fv = validare(form, {
      plugins: { charCounter: plugin },
      fields: { bio: { validators: { stringLength: { max: 20 } } } },
    });
    fv.destroy();
    const counter = form.querySelector(".fv-plugins-char-counter");
    expect(counter?.textContent).toBe("");
  });
});
