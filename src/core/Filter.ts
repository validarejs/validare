// src/core/Filter.ts

export interface Filter {
  add(name: string, func: (...args: unknown[]) => unknown): void;
  remove(name: string, func: (...args: unknown[]) => unknown): void;
  execute<T>(name: string, defaultValue: T, args: unknown[]): T;
}

export function createFilter(): Filter {
  const handlers = new Map<string, Array<(...args: unknown[]) => unknown>>();

  return {
    add(name, func) {
      if (!handlers.has(name)) handlers.set(name, []);
      handlers.get(name)!.push(func);
    },
    remove(name, func) {
      const list = handlers.get(name);
      if (!list) return;
      const idx = list.indexOf(func);
      if (idx !== -1) list.splice(idx, 1);
    },
    execute<T>(name: string, defaultValue: T, args: unknown[]): T {
      const list = handlers.get(name);
      if (!list || list.length === 0) return defaultValue;
      let result: unknown = defaultValue;
      for (const fn of list) {
        result = fn(result, ...args);
      }
      return result as T;
    },
  };
}
