import { stringify } from "flatted";

export function isEqual(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) return true;
	if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
		return false;
	}
	try {
		return stringify(a) === stringify(b);
	} catch (e) {
		void e;
		return false;
	}
}

export function isObjectLike(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
