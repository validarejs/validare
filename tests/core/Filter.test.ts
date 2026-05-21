import { describe, it, expect, vi } from 'vitest';
import { createFilter } from '../../src/core/Filter';

describe('createFilter', () => {
  it('returns defaultValue when no handlers registered', () => {
    const filter = createFilter();
    expect(filter.execute('test', 42, [])).toBe(42);
  });

  it('transforms value through a single handler', () => {
    const filter = createFilter();
    filter.add('double', (v: unknown) => (v as number) * 2);
    expect(filter.execute('double', 5, [])).toBe(10);
  });

  it('chains multiple handlers in registration order', () => {
    const filter = createFilter();
    filter.add('pipe', (v: unknown) => (v as number) + 1);
    filter.add('pipe', (v: unknown) => (v as number) * 3);
    // (5 + 1) * 3 = 18
    expect(filter.execute('pipe', 5, [])).toBe(18);
  });

  it('passes extra args to each handler', () => {
    const filter = createFilter();
    const handler = vi.fn((v: unknown) => v);
    filter.add('test', handler);
    filter.execute('test', 'x', ['a', 'b']);
    expect(handler).toHaveBeenCalledWith('x', 'a', 'b');
  });

  it('removes a specific handler with remove()', () => {
    const filter = createFilter();
    const h1 = (v: unknown) => (v as number) + 1;
    const h2 = (v: unknown) => (v as number) * 10;
    filter.add('test', h1);
    filter.add('test', h2);
    filter.remove('test', h1);
    expect(filter.execute('test', 2, [])).toBe(20);
  });

  it('works with Promise values (validate-pre pattern)', async () => {
    const filter = createFilter();
    filter.add('validate-pre', (_v: unknown) => Promise.resolve());
    const result = filter.execute<Promise<void>>('validate-pre', Promise.resolve(), []);
    await expect(result).resolves.toBeUndefined();
  });
});
