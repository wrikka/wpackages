import { type DiffResult } from "../types";

export interface DiffFilter {
	paths?: string[];
	types?: string[];
	pattern?: RegExp;
}

export function filterDiff(diff: DiffResult, filter: DiffFilter): DiffResult | undefined {
	const filtered: DiffResult = {
		added: {},
		deleted: {},
		updated: {},
	};

	let hasChanges = false;

	if (filter.paths) {
		for (const path of filter.paths) {
			const value = getNestedValue(diff, path);
			if (value) {
				filtered.added[path] = value.added;
				filtered.deleted[path] = value.deleted;
				filtered.updated[path] = value.updated;
				hasChanges = true;
			}
		}
	} else {
		for (const key in diff.added) {
			if (shouldInclude(key, diff.added[key], filter)) {
				filtered.added[key] = diff.added[key];
				hasChanges = true;
			}
		}

		for (const key in diff.deleted) {
			if (shouldInclude(key, diff.deleted[key], filter)) {
				filtered.deleted[key] = diff.deleted[key];
				hasChanges = true;
			}
		}

		for (const key in diff.updated) {
			if (shouldInclude(key, diff.updated[key], filter)) {
				filtered.updated[key] = diff.updated[key];
				hasChanges = true;
			}
		}
	}

	return hasChanges ? filtered : undefined;
}

function getNestedValue(diff: DiffResult, path: string): DiffResult | undefined {
	const keys = path.split(".");
	let current: DiffResult = diff;

	for (const key of keys) {
		const value = current.updated[key];
		if (typeof value === "object" && value !== null && !("__old" in value)) {
			current = value as DiffResult;
		} else {
			return undefined;
		}
	}

	return current;
}

function shouldInclude(key: string, value: unknown, filter: DiffFilter): boolean {
	if (filter.pattern && !filter.pattern.test(key)) {
		return false;
	}

	if (filter.types) {
		const type = getType(value);
		if (!filter.types.includes(type)) {
			return false;
		}
	}

	return true;
}

function getType(value: unknown): string {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	if (value instanceof Map) return "map";
	if (value instanceof Set) return "set";
	return typeof value;
}
