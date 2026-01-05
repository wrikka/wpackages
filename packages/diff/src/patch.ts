import { type DiffResult } from "./diff";
import { ChangeType } from "./lcs";

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
				result.push(source[change.indexA]);
			}
		} else if (change.type === keep) {
			result.push(change.value);
		}
	}
	return result;
}

function patchMap(source: Map<any, any>, diff: DiffResult): Map<any, any> {
	const result = deepClone(source);
	for (const key in diff.deleted) result.delete(key);
	for (const key in diff.added) result.set(key, deepClone(diff.added[key]));
	for (const key in diff.updated) {
		const value = diff.updated[key];
		if (typeof value === "object" && value !== null && "__old" in value && "__new" in value) {
			result.set(key, deepClone(value.__new));
		} else {
			result.set(key, patch(result.get(key), value as DiffResult));
		}
	}
	return result;
}

function unpatchMap(source: Map<any, any>, diff: DiffResult): Map<any, any> {
	const result = deepClone(source);
	for (const key in diff.added) result.delete(key);
	for (const key in diff.deleted) result.set(key, deepClone(diff.deleted[key]));
	for (const key in diff.updated) {
		const value = diff.updated[key];
		if (typeof value === "object" && value !== null && "__old" in value && "__new" in value) {
			result.set(key, deepClone(value.__old));
		} else {
			result.set(key, unpatch(result.get(key), value as DiffResult));
		}
	}
	return result;
}

export function patch<T>(source: T, diff: DiffResult): T {
	if (diff.updated && diff.updated.value) {
		return deepClone(diff.updated.value.__new);
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
			if ("__old" in value && "__new" in value) {
				result[key] = deepClone(value.__new);
			} else if ("_lcs" in value) {
				if (Array.isArray(result[key])) {
					result[key] = applyLcs(result[key], (value as any)._lcs, ChangeType.ADD);
				} else {
					result[key] = patch(result[key], value as DiffResult);
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
	if (diff.updated && diff.updated.value) {
		return deepClone(diff.updated.value.__old);
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
			if ("__old" in value && "__new" in value) {
				result[key] = deepClone(value.__old);
			} else if ("_lcs" in value) {
				result[key] = applyLcs(result[key], (value as any)._lcs, ChangeType.DELETE);
			} else {
				result[key] = unpatch(result[key], value as DiffResult);
			}
		} else {
			result[key] = unpatch(result[key], value as DiffResult);
		}
	}
	return result;
}
