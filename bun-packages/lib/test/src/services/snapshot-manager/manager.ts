import { dirname, relative } from "node:path";
import { updateInlineSnapshotInFile } from "./inline";
import { getSnapshotPath } from "./paths";
import { serializeSnapshotValue } from "./serialize";
import { loadSnapshotFile, saveSnapshotFile } from "./storage";
import type { SnapshotData, SnapshotOptions } from "./types";

class SnapshotManager {
	private snapshotDir: string;
	private inlineSnapshots: boolean;
	private updateSnapshots: boolean;

	constructor(options: SnapshotOptions = {}) {
		this.updateSnapshots = options.updateSnapshots || false;
		this.inlineSnapshots = options.inlineSnapshots || false;
		this.snapshotDir = options.snapshotDir || "__snapshots__";
	}

	private getSnapshotKey(testName: string, customName?: string): string {
		return customName ? `${testName} - ${customName}` : testName;
	}

	matchSnapshot(
		testFile: string,
		testName: string,
		actual: any,
		customName?: string,
	): { matched: boolean; message?: string } {
		const snapshotPath = getSnapshotPath({ testFile, snapshotDir: this.snapshotDir });
		const key = this.getSnapshotKey(testName, customName);
		const snapshots = loadSnapshotFile(snapshotPath);

		if (this.updateSnapshots) {
			snapshots[key] = { value: actual, inline: false };
			saveSnapshotFile(snapshotPath, snapshots);
			return { matched: true, message: "Snapshot updated" };
		}

		const snapshot = snapshots[key];
		if (!snapshot) {
			return {
				matched: false,
				message: `Snapshot "${key}" not found. Run with --update-snapshots to create it.`,
			};
		}

		const expected = snapshot.value;
		const actualStr = serializeSnapshotValue(actual);
		const expectedStr = serializeSnapshotValue(expected);

		if (actualStr === expectedStr) {
			return { matched: true };
		}

		return {
			matched: false,
			message:
				`Snapshot "${key}" mismatch\n\nExpected:\n${expectedStr}\n\nReceived:\n${actualStr}\n\nRun with --update-snapshots to update.`,
		};
	}

	matchInlineSnapshot(
		testFile: string,
		testName: string,
		actual: any,
		expected?: string,
	): { matched: boolean; message?: string; updated?: string } {
		if (this.inlineSnapshots && expected !== undefined) {
			const actualStr = serializeSnapshotValue(actual);
			if (actualStr === expected) {
				return { matched: true };
			}

			if (this.updateSnapshots) {
				const updated = updateInlineSnapshotInFile({ testFile, testName, newValue: actualStr });
				return { matched: true, updated };
			}

			return {
				matched: false,
				message:
					`Inline snapshot mismatch\n\nExpected:\n${expected}\n\nReceived:\n${actualStr}\n\nRun with --update-snapshots to update.`,
			};
		}

		return this.matchSnapshot(testFile, testName, actual, "inline");
	}

	clearSnapshots(testFile: string): void {
		const snapshotPath = getSnapshotPath({ testFile, snapshotDir: this.snapshotDir });
		const snapshots = loadSnapshotFile(snapshotPath);
		const testFileName = relative(dirname(testFile), testFile);
		const testBaseName = testFileName.replace(/\.(test|spec)\.[^.]+$/, "");

		const updatedSnapshots: Record<string, SnapshotData> = {};
		for (const [key, value] of Object.entries(snapshots)) {
			if (!key.startsWith(testBaseName)) {
				updatedSnapshots[key] = value;
			}
		}

		if (Object.keys(updatedSnapshots).length === 0) {
			try {
				require("node:fs").unlinkSync(snapshotPath);
			} catch {
				return;
			}
		} else {
			saveSnapshotFile(snapshotPath, updatedSnapshots);
		}
	}

	listSnapshots(testFile: string): string[] {
		const snapshotPath = getSnapshotPath({ testFile, snapshotDir: this.snapshotDir });
		const snapshots = loadSnapshotFile(snapshotPath);
		return Object.keys(snapshots);
	}

	getSnapshotStats(testFile: string): {
		total: number;
		inline: number;
		file: number;
	} {
		const snapshotPath = getSnapshotPath({ testFile, snapshotDir: this.snapshotDir });
		const snapshots = loadSnapshotFile(snapshotPath);

		let inlineCount = 0;
		let fileCount = 0;

		for (const snapshot of Object.values(snapshots)) {
			if (snapshot.inline) {
				inlineCount++;
			} else {
				fileCount++;
			}
		}

		return {
			total: Object.keys(snapshots).length,
			inline: inlineCount,
			file: fileCount,
		};
	}
}

let globalSnapshotManager: SnapshotManager;

export function createSnapshotManager(options: SnapshotOptions = {}): SnapshotManager {
	if (!globalSnapshotManager) {
		globalSnapshotManager = new SnapshotManager(options);
	}
	return globalSnapshotManager;
}

export function getSnapshotManager(): SnapshotManager {
	if (!globalSnapshotManager) {
		globalSnapshotManager = new SnapshotManager();
	}
	return globalSnapshotManager;
}

export { SnapshotManager };
