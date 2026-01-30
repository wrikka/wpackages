import { type DiffResult } from "../types";

export interface DiffHistoryEntry {
	version: string;
	timestamp: number;
	diff: DiffResult;
}

export class DiffHistory {
	private history: DiffHistoryEntry[] = [];

	add(diff: DiffResult, version: string): void {
		this.history.push({
			version,
			timestamp: Date.now(),
			diff,
		});
	}

	get(version: string): DiffResult | undefined {
		return this.history.find(entry => entry.version === version)?.diff;
	}

	getAll(): DiffHistoryEntry[] {
		return [...this.history];
	}

	getLatest(): DiffHistoryEntry | undefined {
		return this.history[this.history.length - 1];
	}

	getDiffBetween(fromVersion: string, toVersion: string): DiffResult | undefined {
		const fromIndex = this.history.findIndex(entry => entry.version === fromVersion);
		const toIndex = this.history.findIndex(entry => entry.version === toVersion);

		if (fromIndex === -1 || toIndex === -1) {
			return undefined;
		}

		const merged: DiffResult = { added: {}, deleted: {}, updated: {} };

		for (let i = fromIndex; i < toIndex; i++) {
			const entry = this.history[i];
			if (!entry) continue;
			for (const key in entry.diff.added) {
				merged.added[key] = entry.diff.added[key];
			}
			for (const key in entry.diff.deleted) {
				merged.deleted[key] = entry.diff.deleted[key];
			}
			for (const key in entry.diff.updated) {
				merged.updated[key] = entry.diff.updated[key];
			}
		}

		return merged;
	}

	clear(): void {
		this.history = [];
	}
}
