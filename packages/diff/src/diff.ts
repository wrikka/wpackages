import { isEqual, type IsEqualOptions, isObjectLike } from "./isEqual";
import { lcs } from "./lcs";

export interface DiffResult {
	added: Record<string, any>;
	deleted: Record<string, any>;
	updated: Record<string, any>;
}

export interface DiffOptions extends IsEqualOptions {
	ignorePaths?: string[];
}

type Seen = WeakMap<object, WeakMap<object, boolean>>;

function diffInternal(
	expected: unknown,
	actual: unknown,
	seen: Seen,
	options: DiffOptions,
	path: string[],
): DiffResult | undefined {
	const currentPath = path.join(".");
	if (path.length > 0 && options.ignorePaths?.includes(currentPath)) {
		return undefined;
	}

	if (isEqual(expected, actual, options)) {
		return undefined;
	}

	const isEObj = isObjectLike(expected);
	const isAObj = isObjectLike(actual);

	if (isEObj && isAObj) {
		const seenForExpected = seen.get(expected as object);
		if (seenForExpected && seenForExpected.get(actual as object)) {
			return undefined; // Cycle detected
		}
		if (!seenForExpected) {
			seen.set(expected as object, new WeakMap());
		}
		seen.get(expected as object)!.set(actual as object, true);

		const eIsMap = expected instanceof Map;
		const aIsMap = actual instanceof Map;
		if (eIsMap && aIsMap) return diffMaps(expected, actual, seen, options, path);

		const eIsSet = expected instanceof Set;
		const aIsSet = actual instanceof Set;
		if (eIsSet && aIsSet) return diffSets(expected, actual);

		const eIsArray = Array.isArray(expected);
		const aIsArray = Array.isArray(actual);

		if (eIsArray && aIsArray) {
			return diffArrays(expected, actual, options);
		}

		if (eIsMap || aIsMap || eIsSet || aIsSet || eIsArray || aIsArray) {
			// Type mismatch
		} else {
			return diffObjects(expected as Record<string, any>, actual as Record<string, any>, seen, options, path);
		}
	}

	return {
		added: {},
		deleted: {},
		updated: { value: { __old: expected, __new: actual } },
	};
}

function diffObjects(
	expected: Record<string, any>,
	actual: Record<string, any>,
	seen: Seen,
	options: DiffOptions,
	path: string[],
): DiffResult | undefined {
	const result: DiffResult = { added: {}, deleted: {}, updated: {} };
	const allKeys = Array.from(new Set([...Object.keys(expected), ...Object.keys(actual)]));

	for (const key of allKeys.sort()) {
		const newPath = [...path, key];
		const expectedValue = expected[key];
		const actualValue = actual[key];

		if (isEqual(expectedValue, actualValue, options)) {
			continue;
		}

		if (options.ignorePaths?.includes(newPath.join("."))) {
			continue;
		}

		if (!(key in actual)) {
			result.deleted[key] = expectedValue;
		} else if (!(key in expected)) {
			result.added[key] = actualValue;
		} else {
			if (isObjectLike(expectedValue) && isObjectLike(actualValue)) {
				const nestedDiff = diffInternal(expectedValue, actualValue, seen, options, newPath);
				if (nestedDiff) {
					result.updated[key] = nestedDiff;
				}
			} else {
				result.updated[key] = { __old: expectedValue, __new: actualValue };
			}
		}
	}

	if (
		Object.keys(result.added).length === 0 && Object.keys(result.deleted).length === 0
		&& Object.keys(result.updated).length === 0
	) {
		return undefined;
	}
	return result;
}

function diffMaps(
	expected: Map<any, any>,
	actual: Map<any, any>,
	seen: Seen,
	options: DiffOptions,
	path: string[],
): DiffResult | undefined {
	const result: DiffResult = { added: {}, deleted: {}, updated: {} };
	const allKeys = Array.from(new Set([...expected.keys(), ...actual.keys()]));

	for (const key of allKeys) {
		const newPath = [...path, String(key)];
		const expectedValue = expected.get(key);
		const actualValue = actual.get(key);

		if (isEqual(expectedValue, actualValue, options)) {
			continue;
		}

		if (options.ignorePaths?.includes(newPath.join("."))) {
			continue;
		}

		if (!actual.has(key)) {
			result.deleted[key] = expectedValue;
		} else if (!expected.has(key)) {
			result.added[key] = actualValue;
		} else {
			if (isObjectLike(expectedValue) && isObjectLike(actualValue)) {
				const nestedDiff = diffInternal(expectedValue, actualValue, seen, options, newPath);
				if (nestedDiff) {
					result.updated[key] = nestedDiff;
				}
			} else {
				result.updated[key] = { __old: expectedValue, __new: actualValue };
			}
		}
	}
	if (
		Object.keys(result.added).length === 0 && Object.keys(result.deleted).length === 0
		&& Object.keys(result.updated).length === 0
	) {
		return undefined;
	}
	return result;
}

function diffArrays(expected: any[], actual: any[], options: DiffOptions): DiffResult | undefined {
	const changes = lcs(expected, actual, options);

	// If there are no changes, return undefined
	if (changes.every(c => c.type === "common")) {
		return undefined;
	}

	const result: DiffResult = { added: {}, deleted: {}, updated: { _lcs: changes } };
	return result;
}

function diffSets(expected: Set<any>, actual: Set<any>): DiffResult {
	const result: DiffResult = { added: {}, deleted: {}, updated: {} };
	const addedValues = new Set();
	const deletedValues = new Set(expected);

	for (const value of actual) {
		if (deletedValues.has(value)) {
			deletedValues.delete(value);
		} else {
			addedValues.add(value);
		}
	}

	if (deletedValues.size > 0) {
		result.deleted = { values: Array.from(deletedValues) };
	}
	if (addedValues.size > 0) {
		result.added = { values: Array.from(addedValues) };
	}

	return result;
}

export function diff(expected: unknown, actual: unknown, options: DiffOptions = {}): DiffResult | undefined {
	return diffInternal(expected, actual, new WeakMap(), options, []);
}
