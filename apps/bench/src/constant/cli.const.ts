import * as pc from "picocolors";

export const DEFAULT_RUNS = 10;
export const DEFAULT_WARMUP = 3;
export const DEFAULT_SHELL: "pwsh" | "bash" = process.platform === "win32" ? "pwsh" : "bash";

export const PERCENTILES = [25, 50, 75, 90, 95, 99] as const;

export const TIME_UNITS = {
	ms: { factor: 1, name: "milliseconds" },
	ns: { factor: 1e-6, name: "nanoseconds" },
	s: { factor: 1000, name: "seconds" },
	us: { factor: 1e-3, name: "microseconds" },
} as const;

type ColorFn = (input: string) => string;

type Colors = Readonly<{
	bold: ColorFn;
	dim: ColorFn;
	fastest: ColorFn;
	highlight: ColorFn;
	info: ColorFn;
	muted: ColorFn;
	slowest: ColorFn;
	subtitle: ColorFn;
	success: ColorFn;
	title: ColorFn;
	warning: ColorFn;
}>;

export const COLORS: Colors = {
	bold: pc.bold,
	dim: pc.dim,
	fastest: pc.green,
	highlight: pc.cyan,
	info: pc.blue,
	muted: pc.gray,
	slowest: pc.red,
	subtitle: pc.dim,
	success: pc.green,
	title: pc.bold,
	warning: pc.yellow,
};

export const SYMBOLS = {
	arrow: "→",
	bar: "█",
	check: "✓",
	cross: "✗",
	fastest: "🚀",
	slowest: "🐌",
} as const;
