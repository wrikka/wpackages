import { mkdir, readdir, rm } from "fs/promises";
import { join } from "path";
import type { BenchmarkResult, ComparisonResult } from "../types";

const HISTORY_DIR = ".bench/history";

export class HistoryService {
	private async ensureHistoryDir(): Promise<void> {
		await mkdir(HISTORY_DIR, { recursive: true });
	}

	private getFilePath(name: string): string {
		return join(HISTORY_DIR, `${name}.json`);
	}

	async saveRun(name: string, result: BenchmarkResult | ComparisonResult): Promise<string> {
		await this.ensureHistoryDir();
		const filePath = this.getFilePath(name);
		await Bun.write(filePath, JSON.stringify(result, null, 2));
		return filePath;
	}

	async listRuns(): Promise<string[]> {
		await this.ensureHistoryDir();
		const files = await readdir(HISTORY_DIR);
		return files
			.filter(file => file.endsWith(".json"))
			.map(file => file.replace(".json", ""));
	}

	async loadRun(nameOrPath: string): Promise<BenchmarkResult | ComparisonResult> {
		// Check if it's a direct path first
		if (await Bun.file(nameOrPath).exists()) {
			return JSON.parse(await Bun.file(nameOrPath).text());
		}

		// Assume it's a named run in the history directory
		const filePath = this.getFilePath(nameOrPath);
		if (!await Bun.file(filePath).exists()) {
			throw new Error(`Benchmark run '${nameOrPath}' not found.`);
		}
		return JSON.parse(await Bun.file(filePath).text());
	}

	async clearHistory(): Promise<void> {
		await rm(HISTORY_DIR, { recursive: true, force: true });
	}
}
