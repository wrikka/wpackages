import * as fc from "fast-check";
import { it as wtestIt } from "./api/globals";

// Extend the wtest `it` function to include a `prop` method
export const it = Object.assign(wtestIt, {
	prop: <T extends readonly any[]>(
		name: string,
		arbitraries: [...{ [K in keyof T]: fc.Arbitrary<T[K]> }],
		predicate: (...args: T) => Promise<void> | void,
		options?: fc.Parameters<T>,
	) => {
		wtestIt(name, async () => {
			const prop = fc.asyncProperty(...(arbitraries as any), predicate as any);
			await fc.assert(prop, options as any);
		});
	},
});
