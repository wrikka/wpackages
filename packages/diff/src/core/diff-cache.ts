import { type DiffResult } from "../types";

let cache = new WeakMap<object, WeakMap<object, DiffResult>>();

export function diffWithCache(
	expected: unknown,
	actual: unknown,
	computeDiff: (a: unknown, b: unknown) => DiffResult | undefined,
): DiffResult | undefined {
	if (typeof expected !== "object" || expected === null || typeof actual !== "object" || actual === null) {
		return computeDiff(expected, actual);
	}

	let cached = cache.get(expected as object);
	if (!cached) {
		cached = new WeakMap();
		cache.set(expected as object, cached);
	}

	const result = cached.get(actual as object);
	if (result !== undefined) {
		return result;
	}

	const computed = computeDiff(expected, actual);
	if (computed) {
		cached.set(actual as object, computed);
	}

	return computed;
}

export function clearCache(): void {
	cache = new WeakMap();
}
