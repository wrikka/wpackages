import { type DiffResult } from "../types";
import { ChangeType } from "../types";

import rfdc from "rfdc";

const deepClone = rfdc();

function applyLcs<T>(
	source: T[],
	lcs: Array<{ type: ChangeType; value: T; indexA?: number; indexB?: number }>,
	keep: ChangeType.ADD | ChangeType.DELETE,
): T[] {
	const result: T[] = [];
	for (const change of lcs) {
		if (change.type === ChangeType.COMMON) {
			if (change.indexA !== undefined) {
				const value = source[change.indexA];
				if (value !== undefined) {
					result.push(value);
				}
			}
		} else if (change.type === keep) {
			result.push(change.value);
		}
	}
	return result;
}

function isDiffValue(value: unknown): value is { __old: unknown; __new: unknown } {
	return typeof value === "object" && value !== null && "__old" in value && "__new" in value;
}

function isLcsDiff(value: unknown): value is { _lcs: unknown } {
	return typeof value === "object" && value !== null && "_lcs" in value;
}

function patchMap(source: Map<unknown, unknown>, diff: DiffResult): Map<unknown, unknown> {
	const result = deepClone(source);
	for (const key in diff.deleted) result.delete(key);
	for (const key in diff.added) result.set(key, deepClone(diff.added[key]));
	for (const key in diff.updated) {
		const value = diff.updated[key];
		if (isDiffValue(value)) {
			result.set(key, deepClone(value.__new));
		} else {
			result.set(key, patch(result.get(key), value as DiffResult));
		}
	}
	return result;
}

function unpatchMap(source: Map<unknown, unknown>, diff: DiffResult): Map<unknown, unknown> {
	const result = deepClone(source);
	for (const key in diff.added) result.delete(key);
	for (const key in diff.deleted) result.set(key, deepClone(diff.deleted[key]));
	for (const key in diff.updated) {
		const value = diff.updated[key];
		if (isDiffValue(value)) {
			result.set(key, deepClone(value.__old));
		} else {
			result.set(key, unpatch(result.get(key), value as DiffResult));
		}
	}
	return result;
}

export function patch<T>(source: T, diff: DiffResult): T {
	if (diff.updated && diff.updated.value && isDiffValue(diff.updated.value)) {
		return deepClone(diff.updated.value.__new) as T;
	}

	if (source instanceof Map) {
		return patchMap(source, diff) as any;
	}

	const result = deepClone(source) as any;
	for (const key in diff.deleted) delete result[key];
	for (const key in diff.added) result[key] = deepClone(diff.added[key]);
	for (const key in diff.updated) {
		const value = diff.updated[key];
		if (typeof value === "object" && value !== null) {
			if (isDiffValue(value)) {
				result[key] = deepClone(value.__new);
			} else if (isLcsDiff(value)) {
				if (Array.isArray(result[key])) {
					result[key] = applyLcs(result[key], value._lcs as any, ChangeType.ADD);
				} else {
					result[key] = patch(result[key], value as unknown as DiffResult);
				}
			} else {
				result[key] = patch(result[key], value as DiffResult);
			}
		} else {
			result[key] = patch(result[key], value as DiffResult);
		}
	}
	return result;
}

export function unpatch<T>(source: T, diff: DiffResult): T {
	if (diff.updated && diff.updated.value && isDiffValue(diff.updated.value)) {
		return deepClone(diff.updated.value.__old) as T;
	}

	if (source instanceof Map) {
		return unpatchMap(source, diff) as any;
	}

	const result = deepClone(source) as any;
	for (const key in diff.added) delete result[key];
	for (const key in diff.deleted) result[key] = deepClone(diff.deleted[key]);
	for (const key in diff.updated) {
		const value = diff.updated[key];
		if (typeof value === "object" && value !== null) {
			if (isDiffValue(value)) {
				result[key] = deepClone(value.__old);
			} else if (isLcsDiff(value)) {
				result[key] = applyLcs(result[key], value._lcs as any, ChangeType.DELETE);
			} else {
				result[key] = unpatch(result[key], value as DiffResult);
			}
		} else {
			result[key] = unpatch(result[key], value as DiffResult);
		}
	}
	return result;
}
