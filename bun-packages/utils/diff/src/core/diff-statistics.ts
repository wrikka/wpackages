import { type DiffResult } from "../types";

export interface DiffStatistics {
	additions: number;
	deletions: number;
	updates: number;
	totalChanges: number;
	affectedPaths: string[];
	changedTypes: string[];
}

export function getDiffStatistics(diff: DiffResult): DiffStatistics {
	const stats: DiffStatistics = {
		additions: 0,
		deletions: 0,
		updates: 0,
		totalChanges: 0,
		affectedPaths: [],
		changedTypes: [],
	};

	function traverse(diffResult: DiffResult, path = "") {
		for (const key in diffResult.added) {
			stats.additions++;
			stats.totalChanges++;
			stats.affectedPaths.push(path ? `${path}.${key}` : key);
			const type = getType(diffResult.added[key]);
			if (!stats.changedTypes.includes(type)) {
				stats.changedTypes.push(type);
			}
		}

		for (const key in diffResult.deleted) {
			stats.deletions++;
			stats.totalChanges++;
			stats.affectedPaths.push(path ? `${path}.${key}` : key);
			const type = getType(diffResult.deleted[key]);
			if (!stats.changedTypes.includes(type)) {
				stats.changedTypes.push(type);
			}
		}

		for (const key in diffResult.updated) {
			const value = diffResult.updated[key];
			if (typeof value === "object" && value !== null && !("__old" in value) && !("_lcs" in value)) {
				traverse(value as DiffResult, path ? `${path}.${key}` : key);
			} else {
				stats.updates++;
				stats.totalChanges++;
				stats.affectedPaths.push(path ? `${path}.${key}` : key);
				if (typeof value === "object" && value !== null && "__old" in value) {
					const type = getType((value as { __old: unknown }).__old);
					if (!stats.changedTypes.includes(type)) {
						stats.changedTypes.push(type);
					}
				} else if (typeof value === "object" && value !== null && "_lcs" in value) {
					const type = "array";
					if (!stats.changedTypes.includes(type)) {
						stats.changedTypes.push(type);
					}
				} else if (typeof value !== "object" || value === null) {
					const type = getType(value);
					if (!stats.changedTypes.includes(type)) {
						stats.changedTypes.push(type);
					}
				}
			}
		}
	}

	traverse(diff);

	return stats;
}

function getType(value: unknown): string {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	if (value instanceof Map) return "map";
	if (value instanceof Set) return "set";
	if (value instanceof Date) return "date";
	if (value instanceof RegExp) return "regexp";
	return typeof value;
}

export function formatStatistics(stats: DiffStatistics): string {
	return `
Diff Statistics:
- Additions: ${stats.additions}
- Deletions: ${stats.deletions}
- Updates: ${stats.updates}
- Total Changes: ${stats.totalChanges}
- Affected Paths: ${stats.affectedPaths.length}
- Changed Types: ${stats.changedTypes.join(", ")}
`.trim();
}
