import { Effect } from "effect";
import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";

export const makeFileSystemService = () => ({
	readdir: (path: string): Effect.Effect<Dirent[], Error> =>
		Effect.tryPromise({
			try: () => readdir(path, { withFileTypes: true }),
			catch: (e) =>
				new Error(`Failed to read directory: ${path}`, { cause: e }),
		}),
	readFile: (path: string): Effect.Effect<string, Error> =>
		Effect.tryPromise({
			try: () => readFile(path, "utf-8"),
			catch: (e) => new Error(`Failed to read file: ${path}`, { cause: e }),
		}),
});

export const FileSystemService = makeFileSystemService();
