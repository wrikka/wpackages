import { Effect } from "effect";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export const walkDirectory = (dir: string): Effect.Effect<readonly string[], Error> =>
	Effect.gen(function* () {
		const entries = yield* Effect.tryPromise({
			try: () => readdir(dir, { withFileTypes: true }),
			catch: (error) => new Error(`Failed to read directory ${dir}: ${error}`),
		});

		const files: string[] = [];

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);

			if (entry.isDirectory()) {
				const subFiles = yield* walkDirectory(fullPath);
				files.push(...subFiles);
			} else if (entry.isFile()) {
				files.push(fullPath);
			}
		}

		return files;
	});

export const fileExists = (path: string): Effect.Effect<boolean, Error> =>
	Effect.tryPromise({
		try: () => stat(path).then(() => true).catch(() => false),
		catch: (error) => new Error(`Failed to check file existence ${path}: ${error}`),
	});

export const readFile = (path: string): Effect.Effect<string, Error> =>
	Effect.tryPromise({
		try: () => Bun.file(path).text(),
		catch: (error) => new Error(`Failed to read file ${path}: ${error}`),
	});
