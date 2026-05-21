import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { remote } from '../../src/validators/remote';
import { makeInput } from '../helpers';

describe('remote', () => {
  const v = remote();

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('valid when server returns { valid: true }', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ valid: true }),
    } as Response);
    const input = makeInput('user@test.com', { url: '/api/check' });
    await expect(v.validate(input)).resolves.toEqual({ valid: true, message: undefined });
  });

  it('invalid when server returns { valid: false, message: "taken" }', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ valid: false, message: 'Email already taken' }),
    } as Response);
    const input = makeInput('user@test.com', { url: '/api/check' });
    await expect(v.validate(input)).resolves.toEqual({ valid: false, message: 'Email already taken' });
  });

  it('invalid when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const input = makeInput('user@test.com', { url: '/api/check' });
    await expect(v.validate(input)).resolves.toEqual({ valid: false });
  });

  it('sends POST when method=POST', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ valid: true }),
    } as Response);
    const input = makeInput('test', { url: '/api/check', method: 'POST' });
    await v.validate(input);
    expect(fetch).toHaveBeenCalledWith('/api/check', expect.objectContaining({ method: 'POST' }));
  });
});
