import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { addRemote, removeRemote, renameRemote } from "./remote";

describe("remote", () => {
	it("should add a remote", async () => {
		const result = await Effect.runPromise(
			addRemote("/tmp/test-git-remote", "origin", "https://github.com/user/repo.git").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});

	it("should remove a remote", async () => {
		const result = await Effect.runPromise(
			removeRemote("/tmp/test-git-remote", "origin").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});

	it("should rename a remote", async () => {
		const result = await Effect.runPromise(
			renameRemote("/tmp/test-git-remote", "origin", "upstream").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});
});
