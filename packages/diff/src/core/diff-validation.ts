import { type DiffResult } from "../types";

export interface DiffValidationResult {
	valid: boolean;
	errors: string[];
}

export function validateDiff(diff: DiffResult): DiffValidationResult {
	const errors: string[] = [];

	if (!diff || typeof diff !== "object") {
		errors.push("Diff must be an object");
		return { valid: false, errors };
	}

	if (!diff.added || typeof diff.added !== "object") {
		errors.push("Diff must have an 'added' property");
	}

	if (!diff.deleted || typeof diff.deleted !== "object") {
		errors.push("Diff must have a 'deleted' property");
	}

	if (!diff.updated || typeof diff.updated !== "object") {
		errors.push("Diff must have an 'updated' property");
	}

	for (const key in diff.updated) {
		const value = diff.updated[key];
		if (typeof value === "object" && value !== null) {
			if ("__old" in value && "__new" in value) {
				continue;
			}
			if ("_lcs" in value) {
				continue;
			}
			const nestedValidation = validateDiff(value as DiffResult);
			if (!nestedValidation.valid) {
				errors.push(`Invalid nested diff at '${key}': ${nestedValidation.errors.join(", ")}`);
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
