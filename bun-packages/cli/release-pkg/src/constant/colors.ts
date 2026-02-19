import pc from "picocolors";

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

export const STEP_COLORS = {
	error: pc.red,
	pending: pc.gray,
	running: pc.blue,
	skipped: pc.yellow,
	success: pc.green,
} as const;

export const SYMBOLS = {
	bullet: "•",
	error: "✖",
	info: "ℹ",
	pending: "○",
	running: "◐",
	success: "✔",
	warning: "⚠",
} as const;
