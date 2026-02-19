import equal from "fast-deep-equal/es6";

export function isEqual(a: unknown, b: unknown): boolean {
	return equal(a, b);
}

export function isObjectLike(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
