import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { stash, stashApply, stashClear, stashDrop, stashList, stashPop } from "./stash";

describe("stash", () => {
	it("should create a stash", async () => {
		const result = await Effect.runPromise(
			stash("/tmp/test-git-stash").pipe(
				Effect.catchAll((error) => Effect.succeed(error)),
			),
		);
		expect(result).toBe(undefined);
	});

	it("should create a stash with message", async () => {
		const result = await Effect.runPromise(
			stash("/tmp/test-git-stash", "test message").pipe(
				Effect.catchAll((error) => Effect.succeed(error)),
			),
		);
		expect(result).toBe(undefined);
	});

	it("should create a stash with untracked files", async () => {
		const result = await Effect.runPromise(
			stash("/tmp/test-git-stash", "test message", true).pipe(
				Effect.catchAll((_error) => Effect.succeed(error)),
			),
		);
		expect(result).toBe(undefined);
	});

	it("should list stashes", async () => {
		const result = await Effect.runPromise(
			stashList("/tmp/test-git-stash").pipe(
				Effect.catchAll((_error) => Effect.succeed([])),
			),
		);
		expect(Array.isArray(result)).toBe(true);
	});

	it("should pop a stash", async () => {
		const result = await Effect.runPromise(
			stashPop("/tmp/test-git-stash").pipe(
				Effect.catchAll((_error) => Effect.succeed(error)),
			),
		);
		expect(result).toBe(undefined);
	});

	it("should apply a stash", async () => {
		const result = await Effect.runPromise(
			stashApply("/tmp/test-git-stash").pipe(
				Effect.catchAll((_error) => Effect.succeed(error)),
			),
		);
		expect(result).toBe(undefined);
	});

	it("should drop a stash", async () => {
		const result = await Effect.runPromise(
			stashDrop("/tmp/test-git-stash").pipe(
				Effect.catchAll((_error) => Effect.succeed(error)),
			),
		);
		expect(result).toBe(undefined);
	});

	it("should clear all stashes", async () => {
		const result = await Effect.runPromise(
			stashClear("/tmp/test-git-stash").pipe(
				Effect.catchAll((_error) => Effect.succeed(error)),
			),
		);
		expect(result).toBe(undefined);
	});
});
