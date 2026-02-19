import fs from "node:fs/promises";
import path from "node:path";

const SNAPSHOT_DIR = "__snapshots__";

export class SnapshotService {
	private snapshotPath: string;
	private snapshots: Record<string, string> = {};
	private dirty = false;

	constructor(private testPath: string) {
		const testDir = path.dirname(testPath);
		const testFile = path.basename(testPath);
		this.snapshotPath = path.join(testDir, SNAPSHOT_DIR, `${testFile}.snap`);
	}

	async load() {
		try {
			const content = await fs.readFile(this.snapshotPath, "utf-8");
			// A simple parser, could be improved to handle escaped backticks
			this.snapshots = content.split("\n`\n").reduce((acc, part) => {
				if (part.trim()) {
					const [key, ...valueParts] = part.split("` = `");
					acc[key.slice(1)] = valueParts.join("` = `").slice(0, -1);
				}
				return acc;
			}, {} as Record<string, string>);
		} catch {
			// Snapshot file doesn't exist, which is fine.
		}
	}

	async save() {
		if (!this.dirty) return;

		const content = Object.entries(this.snapshots)
			.map(([key, value]) => `exports[\`${key}\`] = \`\n${value}\n\`;`)
			.join("\n\n");

		await fs.mkdir(path.dirname(this.snapshotPath), { recursive: true });
		await fs.writeFile(this.snapshotPath, content);
		this.dirty = false;
	}

	get(key: string): string | undefined {
		return this.snapshots[key];
	}

	set(key: string, value: string) {
		this.snapshots[key] = value;
		this.dirty = true;
	}
}
