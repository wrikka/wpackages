import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

interface SnapshotOptions {
	updateSnapshots?: boolean;
	snapshotDir?: string;
	inlineSnapshots?: boolean;
}

interface SnapshotData {
	value: any;
	inline?: boolean;
}

class SnapshotManager {
	private snapshotDir: string;
	private inlineSnapshots: boolean;
	private updateSnapshots: boolean;

	constructor(options: SnapshotOptions = {}) {
		this.updateSnapshots = options.updateSnapshots || false;
		this.inlineSnapshots = options.inlineSnapshots || false;
		this.snapshotDir = options.snapshotDir || "__snapshots__";
	}

	private getSnapshotPath(testFile: string): string {
		const testDir = dirname(testFile);
		const snapshotSubDir = join(testDir, this.snapshotDir);
		const testFileName = relative(testDir, testFile);
		const snapshotFileName = testFileName.replace(/\.(test|spec)\.[^.]+$/, ".snap");
		return join(snapshotSubDir, snapshotFileName);
	}

	private ensureSnapshotDir(snapshotPath: string): void {
		const dir = dirname(snapshotPath);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	}

	private loadSnapshotFile(snapshotPath: string): Record<string, SnapshotData> {
		if (!existsSync(snapshotPath)) {
			return {};
		}

		try {
			const content = readFileSync(snapshotPath, "utf8");
			return JSON.parse(content);
		} catch (error) {
			console.warn(`Failed to load snapshot file ${snapshotPath}:`, error);
			return {};
		}
	}

	private saveSnapshotFile(snapshotPath: string, snapshots: Record<string, SnapshotData>): void {
		this.ensureSnapshotDir(snapshotPath);
		const content = JSON.stringify(snapshots, null, 2);
		writeFileSync(snapshotPath, content, "utf8");
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
		const snapshotPath = this.getSnapshotPath(testFile);
		const key = this.getSnapshotKey(testName, customName);
		const snapshots = this.loadSnapshotFile(snapshotPath);

		if (this.updateSnapshots) {
			// Update mode: always save the new value
			snapshots[key] = { value: actual, inline: false };
			this.saveSnapshotFile(snapshotPath, snapshots);
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
		const actualStr = this.serialize(actual);
		const expectedStr = this.serialize(expected);

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
			// Inline snapshot mode with provided expected value
			const actualStr = this.serialize(actual);
			if (actualStr === expected) {
				return { matched: true };
			}

			if (this.updateSnapshots) {
				// Update inline snapshot in test file
				const updated = this.updateInlineSnapshotInFile(testFile, testName, actualStr);
				return { matched: true, updated };
			}

			return {
				matched: false,
				message:
					`Inline snapshot mismatch\n\nExpected:\n${expected}\n\nReceived:\n${actualStr}\n\nRun with --update-snapshots to update.`,
			};
		}

		// Fallback to file-based snapshots
		return this.matchSnapshot(testFile, testName, actual, "inline");
	}

	private updateInlineSnapshotInFile(testFile: string, testName: string, newValue: string): string {
		const content = readFileSync(testFile, "utf8");
		const lines = content.split("\n");

		// Find the test function and the inline snapshot
		let inTest = false;
		let snapshotLine = -1;
		let indentLevel = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// Detect test function start
			if (line.includes("it(") || line.includes("test(")) {
				if (line.includes(`"${testName}"`) || line.includes(`'${testName}'`) || line.includes(`\`${testName}\``)) {
					inTest = true;
					indentLevel = line.match(/^(\s*)/)?.[1]?.length || 0;
					continue;
				}
			}

			// Detect end of test function
			if (inTest && line.includes("});")) {
				break;
			}

			// Find inline snapshot call
			if (inTest && line.includes("toMatchInlineSnapshot(")) {
				snapshotLine = i;
				break;
			}
		}

		if (snapshotLine === -1) {
			throw new Error(`Could not find inline snapshot for test "${testName}"`);
		}

		// Update the snapshot value
		const indent = " ".repeat(indentLevel + 2);
		lines[snapshotLine] = `${indent}.toMatchInlineSnapshot(${JSON.stringify(newValue)});`;

		// Write updated content
		const updatedContent = lines.join("\n");
		writeFileSync(testFile, updatedContent, "utf8");

		return updatedContent;
	}

	private serialize(value: any): string {
		if (value === null) return "null";
		if (value === undefined) return "undefined";
		if (typeof value === "string") return value;
		if (typeof value === "number") return String(value);
		if (typeof value === "boolean") return String(value);
		if (typeof value === "bigint") return `${value}n`;

		if (Array.isArray(value)) {
			return `[${value.map(item => this.serialize(item)).join(", ")}]`;
		}

		if (typeof value === "object") {
			try {
				return JSON.stringify(value, null, 2);
			} catch {
				return String(value);
			}
		}

		return String(value);
	}

	clearSnapshots(testFile: string): void {
		const snapshotPath = this.getSnapshotPath(testFile);
		if (existsSync(snapshotPath)) {
			const snapshots = this.loadSnapshotFile(snapshotPath);
			const testFileName = relative(dirname(testFile), testFile);
			const testBaseName = testFileName.replace(/\.(test|spec)\.[^.]+$/, "");

			// Clear only snapshots related to this test file
			const updatedSnapshots: Record<string, SnapshotData> = {};
			for (const [key, value] of Object.entries(snapshots)) {
				if (!key.startsWith(testBaseName)) {
					updatedSnapshots[key] = value;
				}
			}

			if (Object.keys(updatedSnapshots).length === 0) {
				// Delete the snapshot file if empty
				require("node:fs").unlinkSync(snapshotPath);
			} else {
				this.saveSnapshotFile(snapshotPath, updatedSnapshots);
			}
		}
	}

	listSnapshots(testFile: string): string[] {
		const snapshotPath = this.getSnapshotPath(testFile);
		const snapshots = this.loadSnapshotFile(snapshotPath);
		return Object.keys(snapshots);
	}

	getSnapshotStats(testFile: string): {
		total: number;
		inline: number;
		file: number;
	} {
		const snapshotPath = this.getSnapshotPath(testFile);
		const snapshots = this.loadSnapshotFile(snapshotPath);

		let inline = 0;
		let file = 0;

		for (const snapshot of Object.values(snapshots)) {
			if (snapshot.inline) {
				inline++;
			} else {
				file++;
			}
		}

		return {
			total: Object.keys(snapshots).length,
			inline,
			file,
		};
	}
}

// Global snapshot manager instance
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

export { SnapshotManager, type SnapshotOptions };
