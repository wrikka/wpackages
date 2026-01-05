import { Effect } from "effect";
import { join } from "node:path";
import { Arr, File } from "../utils";
import { FileSystemService } from "./file-system.service";

const walkDirectory = (dir: string): Effect.Effect<string[], Error> =>
	Effect.gen(function*() {
		const entries = yield* FileSystemService.readdir(dir);
		const files: string[][] = yield* Effect.all(
			entries.map((entry) => {
				const fullPath = join(dir, entry.name);
				if (entry.isDirectory()) {
					return File.shouldIgnoreDirectory(entry.name)
						? Effect.succeed([])
						: walkDirectory(fullPath);
				}
				return File.isLintableFile(entry.name)
					? Effect.succeed([fullPath])
					: Effect.succeed([]);
			}),
		);
		return files.flat();
	});

export const findFiles = (
	rootDir: string,
	ignore: readonly string[] = [],
): Effect.Effect<readonly string[], Error> =>
	Effect.gen(function*() {
		const allFiles = yield* walkDirectory(rootDir);
		return Arr.filter(
			allFiles,
			(file) =>
				!ignore.some((pattern) => {
					const normalized = File.normalizePath(file);
					return normalized.includes(pattern.replace(/\*\*/g, ""));
				}),
		);
	});

export const findFilesInMultipleDirs = (
	paths: readonly string[],
	ignore: readonly string[] = [],
): Effect.Effect<readonly string[], Error> =>
	Effect.gen(function*(_) {
		const results = yield* _(Effect.all(
			paths.map((path) =>
				Effect.gen(function*(_) {
					const stats = yield* _(FileSystemService.stat(path));
					if (stats.isDirectory()) {
						return yield* _(findFiles(path, ignore));
					}
					if (stats.isFile() && File.isLintableFile(path)) {
						return [path];
					}
					return [];
				})
			),
		));
		return Arr.flatMap(results, (files) => files);
	});
