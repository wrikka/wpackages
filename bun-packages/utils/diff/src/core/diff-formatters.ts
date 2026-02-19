import { type DiffResult } from "../types";

export type DiffFormatter = (diff: DiffResult) => string;

export const formatters: Record<string, DiffFormatter> = {
	json: (diff) => JSON.stringify(diff, null, 2),
	compact: (diff) => JSON.stringify(diff),
	summary: (diff) => {
		const additions = Object.keys(diff.added).length;
		const deletions = Object.keys(diff.deleted).length;
		const updates = Object.keys(diff.updated).length;
		return `Additions: ${additions}, Deletions: ${deletions}, Updates: ${updates}`;
	},
};

export function formatDiff(diff: DiffResult, format: keyof typeof formatters | DiffFormatter): string {
	if (typeof format === "function") {
		return format(diff);
	}
	return formatters[format]!(diff);
}

export function registerFormatter(name: string, formatter: DiffFormatter): void {
	formatters[name] = formatter;
}
