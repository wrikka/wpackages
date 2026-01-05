import { isEqual, isObjectLike } from "./isEqual";
import { lcs, ChangeType } from "./lcs";

export interface DiffResult {
	added: Record<string, any>;
	deleted: Record<string, any>;
	updated: Record<string, any>;
}

export interface DiffOptions {
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

	if (isEqual(expected, actual)) {
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
			return diffArrays(expected, actual);
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

		if (isEqual(expectedValue, actualValue)) {
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

		if (options.ignorePaths?.includes(newPath.join("."))) {
			continue;
		}

		if (!actual.has(key)) {
			result.deleted[String(key)] = expectedValue;
		} else if (!expected.has(key)) {
			result.added[String(key)] = actualValue;
		} else if (!isEqual(expectedValue, actualValue)) {
			if (isObjectLike(expectedValue) && isObjectLike(actualValue)) {
				const nestedDiff = diffInternal(expectedValue, actualValue, seen, options, newPath);
				if (nestedDiff) {
					result.updated[String(key)] = nestedDiff;
				}
			} else {
				result.updated[String(key)] = { __old: expectedValue, __new: actualValue };
			}
		}
	}

	if (
		Object.keys(result.added).length === 0 &&
		Object.keys(result.deleted).length === 0 &&
		Object.keys(result.updated).length === 0
	) {
		return undefined;
	}

	return result;
}

function diffArrays(expected: any[], actual: any[]): DiffResult | undefined {
	const changes = lcs(expected, actual);

	// If there are no changes, return undefined
	if (changes.every(c => c.type === ChangeType.COMMON)) {
		return undefined;
	}

	const result: DiffResult = { added: {}, deleted: {}, updated: { _lcs: changes } };
	return result;
}

function diffSets(expected: Set<any>, actual: Set<any>): DiffResult | undefined {
	const result: DiffResult = { added: {}, deleted: {}, updated: {} };
	const addedValues = new Set();
	const deletedValues = new Set(expected);

	for (const value of actual) {
		let found = false;
		for (const v of deletedValues) {
			if (isEqual(v, value)) {
				deletedValues.delete(v);
				found = true;
				break;
			}
		}
		if (!found) {
			addedValues.add(value);
		}
	}

	if (deletedValues.size > 0) {
		result.deleted = { values: Array.from(deletedValues) };
	}
	if (addedValues.size > 0) {
		result.added = { values: Array.from(addedValues) };
	}

	if (deletedValues.size === 0 && addedValues.size === 0) {
		return undefined;
	}

	return result;
}

export function diff(expected: unknown, actual: unknown, options: DiffOptions = {}): DiffResult | undefined {
	return diffInternal(expected, actual, new WeakMap(), options, []);
}
