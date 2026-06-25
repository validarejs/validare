import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { remote } from "../../src/validators/remote";
import { makeInput } from "../helpers";

describe("remote", () => {
  const v = remote();

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("valid when server returns { valid: true }", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ valid: true }),
    } as Response);
    const input = makeInput("user@test.com", { url: "/api/check" });
    await expect(v.validate(input)).resolves.toEqual({ valid: true, message: undefined });
  });

  it('invalid when server returns { valid: false, message: "taken" }', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ valid: false, message: "Email already taken" }),
    } as Response);
    const input = makeInput("user@test.com", { url: "/api/check" });
    await expect(v.validate(input)).resolves.toEqual({
      valid: false,
      message: "Email already taken",
    });
  });

  it("invalid when fetch throws", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
    const input = makeInput("user@test.com", { url: "/api/check" });
    await expect(v.validate(input)).resolves.toEqual({ valid: false });
  });

  it("sends POST when method=POST", async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ valid: true }),
    } as Response);
    const input = makeInput("test", { url: "/api/check", method: "POST" });
    await v.validate(input);
    expect(fetch).toHaveBeenCalledWith("/api/check", expect.objectContaining({ method: "POST" }));
  });

  describe("with cache: true", () => {
    it("returns cached result on second call with same value", async () => {
      const cv = remote();
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ valid: true }),
      } as Response);
      const input = makeInput("cached@test.com", { url: "/api/check", cache: true });
      await cv.validate(input);
      await cv.validate(input);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("makes new request for different value", async () => {
      const cv = remote();
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ valid: true }),
      } as Response);
      await cv.validate(makeInput("user1@test.com", { url: "/api/check", cache: true }));
      await cv.validate(makeInput("user2@test.com", { url: "/api/check", cache: true }));
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("makes new request for different url", async () => {
      const cv = remote();
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ valid: true }),
      } as Response);
      await cv.validate(makeInput("user@test.com", { url: "/api/check-email", cache: true }));
      await cv.validate(makeInput("user@test.com", { url: "/api/check-username", cache: true }));
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("does not cache when cache option is omitted", async () => {
      const cv = remote();
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ valid: true }),
      } as Response);
      const input = makeInput("user@test.com", { url: "/api/check" });
      await cv.validate(input);
      await cv.validate(input);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
