import { type DiffOptions, type DiffResult, type Seen } from "../types";
import { isEqual, isObjectLike } from "../utils/isEqual";

export function diffMaps(
	expected: Map<unknown, unknown>,
	actual: Map<unknown, unknown>,
	seen: Seen,
	options: DiffOptions,
	path: string[],
	diffInternal: (
		expected: unknown,
		actual: unknown,
		seen: Seen,
		options: DiffOptions,
		path: string[],
	) => DiffResult | undefined,
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
		Object.keys(result.added).length === 0
		&& Object.keys(result.deleted).length === 0
		&& Object.keys(result.updated).length === 0
	) {
		return undefined;
	}

	return result;
}
