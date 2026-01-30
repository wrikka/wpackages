import { type DiffResult } from "../types";

export function mergeDiffs(diff1: DiffResult, diff2: DiffResult): DiffResult {
	const merged: DiffResult = {
		added: { ...diff1.added },
		deleted: { ...diff1.deleted },
		updated: { ...diff1.updated },
	};

	for (const key in diff2.added) {
		if (key in diff1.deleted) {
			delete merged.deleted[key];
		}
		merged.added[key] = diff2.added[key];
	}

	for (const key in diff2.deleted) {
		if (key in diff1.added) {
			delete merged.added[key];
		}
		merged.deleted[key] = diff2.deleted[key];
	}

	for (const key in diff2.updated) {
		const value1 = diff1.updated[key];
		const value2 = diff2.updated[key];

		if (typeof value1 === "object" && value1 !== null && typeof value2 === "object" && value2 !== null) {
			if (!("__old" in value1) && !("__old" in value2)) {
				merged.updated[key] = mergeDiffs(value1 as DiffResult, value2 as DiffResult);
			} else {
				merged.updated[key] = value2;
			}
		} else {
			merged.updated[key] = value2;
		}
	}

	return merged;
}
