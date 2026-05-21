import { describe, it, expect, afterEach } from "vitest";
import { validare } from "../../src/index";
import { pt_BR } from "../../src/locales/pt_BR";
import { en_US } from "../../src/locales/en_US";
import { makeForm } from "../helpers";

const EXPECTED_KEYS = [
  "notEmpty", "email", "creditCard", "date", "digits", "integer", "numeric",
  "regexp", "uri", "identical", "different", "between", "greaterThan", "lessThan",
  "stringLength", "stringCase", "choice", "file", "callback", "promise", "remote", "ip",
  "base64", "hex", "mac", "bic", "uuid", "color", "step", "vin",
  "ean", "isbn", "ismn", "issn", "grid", "cusip", "isin", "sedol",
];

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Locale completeness", () => {
  it.each(EXPECTED_KEYS)("en_US has non-empty message for %s", (key) => {
    expect(en_US[key]?.default).toBeTruthy();
  });
  it.each(EXPECTED_KEYS)("pt_BR has non-empty message for %s", (key) => {
    expect(pt_BR[key]?.default).toBeTruthy();
  });
});

describe('Locales', () => {
  it('uses en_US message when locale is en_US', async () => {
    const form = makeForm({ name: '' });
    const messages: string[] = [];

    const fv = validare(form, {
      locale: en_US,
      fields: { name: { validators: { notEmpty: {} } } },
    });

    fv.on('core.validator.validated', (payload: unknown) => {
      const p = payload as { result: { message: string; valid: boolean } };
      if (!p.result.valid) messages.push(p.result.message);
    });

    await fv.validate();
    expect(messages[0]).toBe(en_US.notEmpty.default);
    expect(typeof messages[0]).toBe('string');
    expect(messages[0].length).toBeGreaterThan(0);
  });

  it('uses pt_BR message when locale is pt_BR', async () => {
    const form = makeForm({ name: '' });
    const messages: string[] = [];

    const fv = validare(form, {
      locale: pt_BR,
      fields: { name: { validators: { notEmpty: {} } } },
    });

    fv.on('core.validator.validated', (payload: unknown) => {
      const p = payload as { result: { message: string; valid: boolean } };
      if (!p.result.valid) messages.push(p.result.message);
    });

    await fv.validate();
    expect(messages[0]).toBe(pt_BR.notEmpty.default);
  });

  it('field-level message overrides locale message', async () => {
    const form = makeForm({ name: '' });
    const messages: string[] = [];

    const fv = validare(form, {
      locale: pt_BR,
      fields: {
        name: { validators: { notEmpty: { message: 'Custom override message' } } },
      },
    });

    fv.on('core.validator.validated', (payload: unknown) => {
      const p = payload as { result: { message: string; valid: boolean } };
      if (!p.result.valid) messages.push(p.result.message);
    });

    await fv.validate();
    expect(messages[0]).toBe('Custom override message');
  });

  it('falls back to default message when no locale provided', async () => {
    const form = makeForm({ name: '' });
    const messages: string[] = [];

    const fv = validare(form, {
      fields: { name: { validators: { notEmpty: {} } } },
    });

    fv.on('core.validator.validated', (payload: unknown) => {
      const p = payload as { result: { message: string; valid: boolean } };
      if (!p.result.valid) messages.push(p.result.message);
    });

    await fv.validate();
    expect(messages[0]).toBe('This value is not valid');
  });
});
