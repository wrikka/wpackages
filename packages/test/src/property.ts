import { it as vitestIt } from "vitest";
import * as fc from "fast-check";

// Extend the vitest `it` function to include a `prop` method
export const it = Object.assign(vitestIt, {
  prop: <T extends readonly any[]>(
    name: string,
    arbitraries: [...{ [K in keyof T]: fc.Arbitrary<T[K]> }],
    predicate: (...args: T) => Promise<void> | void,
    options?: fc.Parameters<T>
  ) => {
    vitestIt(name, async () => {
      const prop = fc.asyncProperty(...(arbitraries as any), predicate as any);
      await fc.assert(prop, options as any);
    });
  },
});
