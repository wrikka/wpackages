import { promises as fs, watch as fsWatch } from "node:fs";
import type { FileSystemConfig } from "../fs.config";
import type { DirectoryEntry, FileStats, FileSystem, Result } from "../types/fs";

const tryCatchAsync = async <T, E>(
	fn: () => Promise<T>,
	errorHandler: (error: unknown) => E,
): Promise<Result<T, E>> => {
	try {
		const value = await fn();
		return { ok: true, value };
	} catch (error) {
		return { ok: false, error: errorHandler(error) };
	}
};

// Create file system service
export const createFileSystem = (config: FileSystemConfig): FileSystem => {
	return {
		appendFile: async (path, content) => {
			return tryCatchAsync(
				async () => {
					await fs.appendFile(path, content, config.encoding);
					return undefined;
				},
				(error) => new Error(`Failed to append file ${path}: ${String(error)}`),
			);
		},

		copy: async (src, dest) => {
			return tryCatchAsync(
				async () => {
					await fs.copyFile(src, dest);
					return undefined;
				},
				(error) => new Error(`Failed to copy ${src} to ${dest}: ${String(error)}`),
			);
		},

		exists: async (path) => {
			return tryCatchAsync(
				async () => {
					try {
						await fs.access(path);
						return true;
					} catch {
						return false;
					}
				},
				(error) => new Error(`Failed to check existence ${path}: ${String(error)}`),
			);
		},

		mkdir: async (path, recursive = true) => {
			return tryCatchAsync(
				async () => {
					await fs.mkdir(path, { recursive });
					return undefined;
				},
				(error) => new Error(`Failed to create directory ${path}: ${String(error)}`),
			);
		},

		move: async (src, dest) => {
			return tryCatchAsync(
				async () => {
					await fs.rename(src, dest);
					return undefined;
				},
				(error) => new Error(`Failed to move ${src} to ${dest}: ${String(error)}`),
			);
		},

		readDir: async (path) => {
			return tryCatchAsync(
				async () => {
					const entries = await fs.readdir(path, { withFileTypes: true });
					const dirEntries: DirectoryEntry[] = entries.map((entry) => ({
						isDirectory: entry.isDirectory(),
						isFile: entry.isFile(),
						name: entry.name,
						path: `${path}/${entry.name}`,
					}));
					return dirEntries;
				},
				(error) => new Error(`Failed to read directory ${path}: ${String(error)}`),
			);
		},
		readFile: async (path, encoding = config.encoding) => {
			return tryCatchAsync(
				async () => {
					const content = await fs.readFile(path, encoding);
					return content;
				},
				(error) => new Error(`Failed to read file ${path}: ${String(error)}`),
			);
		},

		readFileBuffer: async (path) => {
			return tryCatchAsync(
				async () => {
					const buffer = await fs.readFile(path);
					return buffer;
				},
				(error) => new Error(`Failed to read file buffer ${path}: ${String(error)}`),
			);
		},

		remove: async (path) => {
			return tryCatchAsync(
				async () => {
					await fs.rm(path, { force: true, recursive: true });
					return undefined;
				},
				(error) => new Error(`Failed to remove ${path}: ${String(error)}`),
			);
		},

		stat: async (path) => {
			return tryCatchAsync(
				async () => {
					const stats = await fs.stat(path);
					const fileStats: FileStats = {
						createdAt: stats.birthtime,
						isDirectory: stats.isDirectory(),
						isFile: stats.isFile(),
						modifiedAt: stats.mtime,
						permissions: stats.mode,
						size: stats.size,
					};
					return fileStats;
				},
				(error) => new Error(`Failed to stat ${path}: ${String(error)}`),
			);
		},

		watch: async (path, callback) => {
			return tryCatchAsync(
				async () => {
					const watcher = fsWatch(path, (eventType, filename) => {
						callback({
							path: filename ? `${path}/${filename}` : path,
							timestamp: Date.now(),
							type: eventType === "rename" ? "rename" : "change",
						});
					});

					return () => watcher.close();
				},
				(error) => new Error(`Failed to watch ${path}: ${String(error)}`),
			);
		},

		writeFile: async (path, content, encoding = config.encoding) => {
			return tryCatchAsync(
				async () => {
					await fs.writeFile(path, content, encoding);
					return undefined;
				},
				(error) => new Error(`Failed to write file ${path}: ${String(error)}`),
			);
		},
	};
};
