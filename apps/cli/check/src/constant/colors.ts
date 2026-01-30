import pc from "picocolors";

export const SEVERITY_COLORS = {
	error: pc.red,
	info: pc.blue,
	warning: pc.yellow,
} as const;

export const STATUS_COLORS = {
	failed: pc.red,
	passed: pc.green,
	skipped: pc.gray,
} as const;

export const COLORS = {
	bold: pc.bold,
	dim: pc.dim,
	error: pc.red,
	highlight: pc.cyan,
	info: pc.blue,
	muted: pc.gray,
	subtitle: pc.dim,
	success: pc.green,
	title: pc.bold,
	warning: pc.yellow,
} as const;
