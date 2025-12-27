import { Effect } from "effect";

/**
 * Bun spawn result
 */
export interface BunSpawnResult {
	readonly exitCode: number | null;
	readonly stdout: ReadableStream<Uint8Array> | undefined;
	readonly stderr: ReadableStream<Uint8Array> | undefined;
}

/**
 * Bun file content result
 */
export interface BunFileResult {
	readonly content: string;
}

/**
 * Spawn a process using Bun
 */
export function bunSpawn(
	command: readonly string[],
	options: {
		readonly cwd: string | undefined;
		readonly stdout: "pipe" | "inherit" | undefined;
		readonly stderr: "pipe" | "inherit" | undefined;
	},
): Effect.Effect<BunSpawnResult, Error> {
	return Effect.sync(() => {
		const proc = Bun.spawn([...command], {
			cwd: options.cwd || process.cwd(),
			stdout: options.stdout || "inherit",
			stderr: options.stderr || "inherit",
		});

		return {
			exitCode: proc.exitCode,
			stdout: proc.stdout,
			stderr: proc.stderr,
		};
	});
}

/**
 * Wait for process to exit
 */
export function waitForProcess(proc: { exited: Promise<number> }): Effect.Effect<number, Error> {
	return Effect.tryPromise(async () => {
		return await proc.exited;
	});
}

/**
 * Read file content using Bun
 */
export function bunReadFile(path: string): Effect.Effect<string, Error> {
	return Effect.sync(() => {
		const file = Bun.file(path);
		return file.toString();
	});
}

/**
 * Read stream as text
 */
export function readStreamAsText(stream: ReadableStream<Uint8Array>): Effect.Effect<string, Error> {
	return Effect.tryPromise(async () => {
		return await new Response(stream).text();
	});
}

/**
 * Check if file exists
 */
export function bunFileExists(path: string): Effect.Effect<boolean, Error> {
	return Effect.sync(() => {
		try {
			Bun.file(path);
			return true; // File exists if we can access it
		} catch {
			return false;
		}
	});
}
