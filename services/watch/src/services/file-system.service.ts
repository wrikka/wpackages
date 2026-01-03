import * as chokidar from "chokidar";
import { Chunk, Effect, Option, Stream } from "effect";

export type WatchEvent =
	| { type: "add"; path: string }
	| { type: "addDir"; path: string }
	| { type: "change"; path: string }
	| { type: "unlink"; path: string }
	| { type: "unlinkDir"; path: string };

export const watch = (path: string): Stream.Stream<WatchEvent, Error> =>
	Stream.async<WatchEvent, Error>((emit) => {
		const watcher = chokidar.watch(path, {
			persistent: true,
			ignoreInitial: true,
		});

		watcher
			.on("add", (path) =>
				emit(Effect.succeed(Chunk.of({ type: "add", path }))),
			)
			.on("addDir", (path) =>
				emit(Effect.succeed(Chunk.of({ type: "addDir", path }))),
			)
			.on("change", (path) =>
				emit(Effect.succeed(Chunk.of({ type: "change", path }))),
			)
			.on("unlink", (path) =>
				emit(Effect.succeed(Chunk.of({ type: "unlink", path }))),
			)
			.on("unlinkDir", (path) =>
				emit(Effect.succeed(Chunk.of({ type: "unlinkDir", path }))),
			)
			.on("error", (error) =>
				emit(Effect.fail(Option.some(new Error(`Watcher error: ${error}`)))),
			)
			.on("ready", () => {
				// This is a side-effect, should be handled with Effect if it were critical.
				// For now, console.log is acceptable for developer feedback.
				console.log("Initial scan complete. Ready for changes");
			});

		return Effect.sync(() => {
			watcher.close();
		});
	});
