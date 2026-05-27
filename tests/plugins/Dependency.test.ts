import { describe, it, expect, vi, afterEach } from "vitest";
import { validare } from "../../src";
import { Dependency } from "../../src/plugins/core/Dependency";
import { makeForm } from "../helpers";

describe("Dependency", () => {
  it("revalidates dependent field when primary field validates", async () => {
    const form = makeForm({ country: "US", zip: "90210" });
    const fv = validare(form, {
      plugins: { dep: new Dependency({ country: "zip" }) },
      fields: {
        country: { validators: { notEmpty: {} } },
        zip: { validators: { notEmpty: {} } },
      },
    });

    const spy = vi.spyOn(fv, "validateField");
    await fv.validateField("country");

    expect(spy).toHaveBeenCalledWith("zip");
  });

  it("revalidates multiple dependents (space-separated)", async () => {
    const form = makeForm({ state: "CA", zip: "90210", city: "LA" });
    const fv = validare(form, {
      plugins: { dep: new Dependency({ state: "zip city" }) },
      fields: {
        state: { validators: { notEmpty: {} } },
        zip: { validators: { notEmpty: {} } },
        city: { validators: { notEmpty: {} } },
      },
    });

    const spy = vi.spyOn(fv, "validateField");
    await fv.validateField("state");

    expect(spy).toHaveBeenCalledWith("zip");
    expect(spy).toHaveBeenCalledWith("city");
  });

  it("does not revalidate dependents when plugin is disabled", async () => {
    const form = makeForm({ country: "US", zip: "90210" });
    const fv = validare(form, {
      plugins: { dep: new Dependency({ country: "zip" }) },
      fields: {
        country: { validators: { notEmpty: {} } },
        zip: { validators: { notEmpty: {} } },
      },
    });
    fv.disablePlugin("dep");

    const spy = vi.spyOn(fv, "validateField");
    await fv.validateField("country");

    expect(spy).not.toHaveBeenCalledWith("zip");
  });

  it("does not loop infinitely when A depends on B and B depends on A", async () => {
    const form = makeForm({ a: "x", b: "y" });
    const fv = validare(form, {
      plugins: { dep: new Dependency({ a: "b", b: "a" }) },
      fields: {
        a: { validators: { notEmpty: {} } },
        b: { validators: { notEmpty: {} } },
      },
    });
    const spy = vi.spyOn(fv, "validateField");
    await fv.validateField("a");
    await new Promise((r) => setTimeout(r, 50)); // let async chain settle

    // Must complete and call validateField a bounded number of times (not infinitely)
    expect(spy.mock.calls.length).toBeLessThan(10);
  });

  it("stops revalidating dependents after uninstall", async () => {
    const form = makeForm({ country: "US", zip: "90210" });
    const fv = validare(form, {
      plugins: { dep: new Dependency({ country: "zip" }) },
      fields: {
        country: { validators: { notEmpty: {} } },
        zip: { validators: { notEmpty: {} } },
      },
    });
    // Uninstall the plugin (without destroying the instance)
    fv.deregisterPlugin("dep");

    const spy = vi.spyOn(fv, "validateField");
    await fv.validateField("country");
    // Listener is removed — zip must NOT be triggered
    expect(spy).not.toHaveBeenCalledWith("zip");
  });
});
