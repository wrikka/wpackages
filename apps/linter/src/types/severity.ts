/**
 * Severity levels for lint messages
 */

export type Severity = "error" | "warning" | "info" | "hint";

export const SEVERITY_LEVELS = {
	ERROR: "error" as const,
	WARNING: "warning" as const,
	INFO: "info" as const,
	HINT: "hint" as const,
};

export const isSeverity = (value: unknown): value is Severity => {
	return (
		typeof value === "string" &&
		["error", "warning", "info", "hint"].includes(value)
	);
};

export const compareSeverity = (a: Severity, b: Severity): number => {
	const order = { error: 0, warning: 1, info: 2, hint: 3 };
	return order[a] - order[b];
};
