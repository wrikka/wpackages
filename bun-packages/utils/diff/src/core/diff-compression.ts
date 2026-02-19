import { type DiffResult } from "../types";

export interface CompressedDiff {
	a: Record<string, unknown>;
	d: Record<string, unknown>;
	u: Record<string, unknown>;
}

export function compressDiff(diff: DiffResult): string {
	const compressed: CompressedDiff = {
		a: diff.added,
		d: diff.deleted,
		u: diff.updated,
	};
	return JSON.stringify(compressed);
}

export function decompressDiff(compressed: string): DiffResult {
	const parsed = JSON.parse(compressed) as CompressedDiff;
	return {
		added: parsed.a,
		deleted: parsed.d,
		updated: parsed.u,
	};
}
