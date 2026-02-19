import { diff } from "@wpackages/diff";
import { AssertionError } from "../../error";

function isObject(value: any): value is Record<string, any> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepSubset(subset: any, superset: any): boolean {
	if (!isObject(subset) || !isObject(superset)) {
		return subset === superset;
	}

	for (const key in subset) {
		if (!superset.hasOwnProperty(key) || !deepSubset(subset[key], superset[key])) {
			return false;
		}
	}

	return true;
}

export function toMatchObject(actual: any, expected: any) {
	if (!isObject(actual) || !isObject(expected)) {
		throw new AssertionError("Both actual and expected values must be objects for toMatchObject.");
	}

	if (!deepSubset(expected, actual)) {
		const difference = diff(expected, actual);
		const differenceText = difference ? JSON.stringify(difference, null, 2) : "";
		throw new AssertionError(
			`Object does not match subset.\n${differenceText}`,
			expected,
			actual,
		);
	}
}
