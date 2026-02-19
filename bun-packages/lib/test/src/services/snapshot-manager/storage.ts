import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { SnapshotData } from "./types";

export function loadSnapshotFile(snapshotPath: string): Record<string, SnapshotData> {
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

export function saveSnapshotFile(snapshotPath: string, snapshots: Record<string, SnapshotData>): void {
	const dir = dirname(snapshotPath);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	const content = JSON.stringify(snapshots, null, 2);
	writeFileSync(snapshotPath, content, "utf8");
}
