/**
 * Severity level constants
 */

import type { Severity } from "../types";

export const SEVERITY: Record<Uppercase<Severity>, Severity> = {
	ERROR: "error",
	WARNING: "warning",
	INFO: "info",
	HINT: "hint",
} as const;

export const SEVERITY_ORDER: Record<Severity, number> = {
	error: 3,
	warning: 2,
	info: 1,
	hint: 0,
} as const;

export const isSeverity = (value: unknown): value is Severity =>
	typeof value === "string" &&
	(value === "error" ||
		value === "warning" ||
		value === "info" ||
		value === "hint");
