import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { FileInfo } from "../types";

export class FileSystemService {
	constructor(private readonly workdir: string) {}

	async readFile(path: string): Promise<string> {
		const fullPath = join(this.workdir, path);
		return await fs.readFile(fullPath, "utf-8");
	}

	async writeFile(path: string, content: string): Promise<void> {
		const fullPath = join(this.workdir, path);
		await fs.writeFile(fullPath, content, "utf-8");
	}

	async deleteFile(path: string): Promise<void> {
		const fullPath = join(this.workdir, path);
		await fs.unlink(fullPath);
	}

	async copyFile(path: string, destination: string): Promise<void> {
		const fullPath = join(this.workdir, path);
		const destPath = join(this.workdir, destination);
		await fs.copyFile(fullPath, destPath);
	}

	async moveFile(path: string, destination: string): Promise<void> {
		const fullPath = join(this.workdir, path);
		const destPath = join(this.workdir, destination);
		await fs.rename(fullPath, destPath);
	}

	async exists(path: string): Promise<boolean> {
		try {
			const fullPath = join(this.workdir, path);
			await fs.access(fullPath);
			return true;
		} catch {
			return false;
		}
	}

	async listFiles(path: string = "."): Promise<FileInfo[]> {
		const fullPath = join(this.workdir, path);
		const entries = await fs.readdir(fullPath, { withFileTypes: true });

		return await Promise.all(
			entries.map(async (entry) => {
				const entryPath = join(fullPath, entry.name);
				const stats = await fs.stat(entryPath);

				return {
					isDirectory: entry.isDirectory(),
					modifiedAt: stats.mtimeMs,
					name: entry.name,
					path: join(path, entry.name),
					size: stats.size,
				};
			}),
		);
	}

	async createDirectory(path: string): Promise<void> {
		const fullPath = join(this.workdir, path);
		await fs.mkdir(fullPath, { recursive: true });
	}

	async deleteDirectory(path: string): Promise<void> {
		const fullPath = join(this.workdir, path);
		await fs.rm(fullPath, { force: true, recursive: true });
	}

	async watchFile(
		path: string,
		callback: (event: "change" | "rename", filename: string | null) => void,
	): Promise<void> {
		const fullPath = join(this.workdir, path);
		const watcher = fs.watch(fullPath);
		for await (const event of watcher) {
			callback(event.eventType as "change" | "rename", event.filename);
		}
	}
}

export const createFileSystemService = (workdir: string): FileSystemService => new FileSystemService(workdir);
