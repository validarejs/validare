import type { ValidatorFactory, ValidatorResult } from "../core/types";

export const remote: ValidatorFactory = () => {
  const cache = new Map<string, ValidatorResult>();

  return {
    async validate(input): Promise<ValidatorResult> {
      const opts = input.options as {
        url: string;
        method?: "GET" | "POST";
        data?: Record<string, string>;
        headers?: Record<string, string>;
        validKey?: string;
        messageKey?: string;
        cache?: boolean;
      };

      const cacheKey = `${opts.url}|${input.value}`;
      if (opts.cache && cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }

      const method = opts.method ?? "GET";
      const validKey = opts.validKey ?? "valid";
      const messageKey = opts.messageKey ?? "message";
      const body: Record<string, string> = { [input.field]: input.value, ...opts.data };

      let url = opts.url;
      const fetchOpts: RequestInit = {
        method,
        headers: { "Content-Type": "application/json", ...opts.headers },
      };

      if (method === "GET") {
        url = `${url}?${new URLSearchParams(body)}`;
      } else {
        fetchOpts.body = JSON.stringify(body);
      }

      let result: ValidatorResult;
      try {
        const res = await fetch(url, fetchOpts);
        const json = (await res.json()) as Record<string, unknown>;
        result = { valid: json[validKey] === true, message: json[messageKey] as string | undefined };
      } catch {
        result = { valid: false };
      }

      if (opts.cache) {
        cache.set(cacheKey, result);
      }
      return result;
    },
  };
};
