import { diff, type DiffResult } from "./diff";

export interface PathNode {
	path: string;
	value: unknown;
	changes?: DiffResult;
}

export interface PathDiffOptions {
	deep?: boolean;
	maxDepth?: number;
}

export function getPaths(diff: DiffResult, basePath = ""): PathNode[] {
	const paths: PathNode[] = [];

	for (const key in diff.added) {
		const path = basePath ? `${basePath}.${key}` : key;
		paths.push({ path, value: diff.added[key] });
	}

	for (const key in diff.deleted) {
		const path = basePath ? `${basePath}.${key}` : key;
		paths.push({ path, value: diff.deleted[key] });
	}

	for (const key in diff.updated) {
		const path = basePath ? `${basePath}.${key}` : key;
		const value = diff.updated[key];

		if (typeof value === "object" && value !== null && !("__old" in value) && !("_lcs" in value)) {
			paths.push({ path, value, changes: value as DiffResult });
			const nestedPaths = getPaths(value as DiffResult, path);
			paths.push(...nestedPaths);
		} else {
			paths.push({ path, value });
		}
	}

	return paths;
}

export function getValueByPath(obj: unknown, path: string): unknown | undefined {
	const keys = path.split(".");
	let current: unknown = obj;

	for (const key of keys) {
		if (typeof current !== "object" || current === null) {
			return undefined;
		}

		if (Array.isArray(current)) {
			const index = Number.parseInt(key, 10);
			if (Number.isNaN(index)) {
				return undefined;
			}
			current = current[index];
		} else {
			current = (current as Record<string, unknown>)[key];
		}

		if (current === undefined) {
			return undefined;
		}
	}

	return current;
}

export function setValueByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
	const keys = path.split(".");
	const lastKey = keys.pop()!;

	let current: Record<string, unknown> = obj;

	for (const key of keys) {
		if (!(key in current)) {
			current[key] = {};
		}

		const next = current[key];
		if (typeof next !== "object" || next === null) {
			current[key] = {};
		}

		current = current[key] as Record<string, unknown>;
	}

	current[lastKey] = value;
}

export function getChangedPaths(diff: DiffResult): string[] {
	const paths = getPaths(diff);
	return paths.map(p => p.path);
}
