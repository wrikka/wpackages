import { type DiffResult } from "../types";

export interface SerializedDiff {
	version: string;
	timestamp: number;
	diff: DiffResult;
	metadata?: Record<string, unknown>;
}

export function serializeDiff(diff: DiffResult, metadata?: Record<string, unknown>): string {
	const serialized: SerializedDiff = {
		version: "1.0.0",
		timestamp: Date.now(),
		diff,
		...(metadata !== undefined ? { metadata } : {}),
	};
	return JSON.stringify(serialized);
}

export function deserializeDiff(serialized: string): DiffResult {
	const parsed = JSON.parse(serialized) as SerializedDiff;
	return parsed.diff;
}

export function validateSerializedDiff(serialized: string): boolean {
	try {
		const parsed = JSON.parse(serialized) as SerializedDiff;
		return !!parsed.version && !!parsed.timestamp && !!parsed.diff;
	} catch {
		return false;
	}
}
