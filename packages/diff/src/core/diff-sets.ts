import { type DiffResult } from "../types";
import { isEqual } from "../utils/isEqual";

export function diffSets(expected: Set<unknown>, actual: Set<unknown>): DiffResult | undefined {
	const result: DiffResult = { added: {}, deleted: {}, updated: {} };
	const addedValues = new Set<unknown>();
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
