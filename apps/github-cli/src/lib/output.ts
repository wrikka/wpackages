import { loadConfig } from "./config";

export type OutputMode = "text" | "json" | "table" | "md";

export interface OutputOptions {
	quiet?: boolean;
	output?: OutputMode;
}

export function getOutputMode(overrides: OutputOptions = {}): OutputMode {
	const cfg = loadConfig();
	return overrides.output ?? cfg.output ?? "text";
}

export function isQuiet(overrides: OutputOptions = {}): boolean {
	const cfg = loadConfig();
	return overrides.quiet ?? cfg.quiet ?? false;
}

export function formatOutput<T>(
	data: T,
	mode: OutputMode,
	quiet: boolean,
): string | void {
	if (quiet) return;

	switch (mode) {
		case "json":
			return JSON.stringify(data, null, 2);
		case "table":
			// Simple table formatting for arrays of objects
			if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
				const headers = Object.keys(data[0] as Record<string, unknown>);
				const rows = data.map((item) =>
					headers.map((h) => {
						const val = (item as Record<string, unknown>)[h];
						return val === undefined || val === null ? "" : String(val);
					})
				);
				const maxWidths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
				const formatRow = (cells: string[]) =>
					" | " + cells.map((cell, i) => cell.padEnd(maxWidths[i])).join(" | ") + " |";
				return [formatRow(headers), formatRow(maxWidths.map(() => "-")), ...rows.map(formatRow)].join("\n");
			}
			return String(data);
		case "md":
			// Simple markdown formatting
			if (Array.isArray(data)) {
				return data.map((item) => `- ${String(item)}`).join("\n");
			}
			return String(data);
		case "text":
		default:
			return String(data);
	}
}

export function printOutput<T>(data: T, options: OutputOptions = {}): void {
	const mode = getOutputMode(options);
	const quiet = isQuiet(options);
	const output = formatOutput(data, mode, quiet);
	if (output) {
		console.log(output);
	}
}
