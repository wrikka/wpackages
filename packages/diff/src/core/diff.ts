import { type DiffOptions, type DiffResult, type Seen } from "../types";
import { isEqual, isObjectLike } from "../utils/isEqual";
import { diffArrays } from "./diff-arrays";
import { diffMaps } from "./diff-maps";
import { diffObjects } from "./diff-objects";
import { diffSets } from "./diff-sets";

export type { DiffOptions, DiffResult };

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
			return undefined;
		}
		if (!seenForExpected) {
			seen.set(expected as object, new WeakMap());
		}
		seen.get(expected as object)!.set(actual as object, true);

		const eIsMap = expected instanceof Map;
		const aIsMap = actual instanceof Map;
		if (eIsMap && aIsMap) return diffMaps(expected, actual, seen, options, path, diffInternal);

		const eIsSet = expected instanceof Set;
		const aIsSet = actual instanceof Set;
		if (eIsSet && aIsSet) return diffSets(expected, actual);

		const eIsArray = Array.isArray(expected);
		const aIsArray = Array.isArray(actual);

		if (eIsArray && aIsArray) {
			return diffArrays(expected, actual);
		}

		if (eIsMap || aIsMap || eIsSet || aIsSet || eIsArray || aIsArray) {
		} else {
			return diffObjects(
				expected as Record<string, unknown>,
				actual as Record<string, unknown>,
				seen,
				options,
				path,
				diffInternal,
			);
		}
	}

	return {
		added: {},
		deleted: {},
		updated: { value: { __old: expected, __new: actual } },
	};
}

export function diff(expected: unknown, actual: unknown, options: DiffOptions = {}): DiffResult | undefined {
	return diffInternal(expected, actual, new WeakMap(), options, []);
}
