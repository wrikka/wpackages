import { type DiffResult } from "../types";

export function reverseDiff(diff: DiffResult): DiffResult {
	const reversed: DiffResult = {
		added: { ...diff.deleted },
		deleted: { ...diff.added },
		updated: {},
	};

	for (const key in diff.updated) {
		const value = diff.updated[key];
		if (typeof value === "object" && value !== null && "__old" in value && "__new" in value) {
			reversed.updated[key] = { __old: value.__new, __new: value.__old };
		} else if (typeof value === "object" && value !== null && !("__old" in value)) {
			reversed.updated[key] = reverseDiff(value as DiffResult);
		}
	}

	return reversed;
}
