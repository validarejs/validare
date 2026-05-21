// tests/helpers.ts
import type { ValidatorInput } from '../src/core/types';

/** Creates a minimal ValidatorInput for use in validator unit tests */
export function makeInput(
  value: string,
  options: Record<string, unknown> = {},
  overrides: Partial<Omit<ValidatorInput, 'value' | 'options'>> = {},
): ValidatorInput {
  const form = document.createElement('form');
  const input = document.createElement('input');
  input.setAttribute('name', overrides.field ?? 'testField');
  input.value = value;
  form.appendChild(input);

  return {
    value,
    options,
    field: 'testField',
    elements: [input],
    form,
    ...overrides,
  };
}

/** Creates a form with named inputs for integration tests */
export function makeForm(fields: Record<string, string>): HTMLFormElement {
  const form = document.createElement('form');
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.setAttribute('name', name);
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  return form;
}
