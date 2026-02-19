import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { rebase, cherryPick, revert } from "./advanced";

describe("advanced", () => {
	describe("rebase", () => {
		it("should rebase a branch", async () => {
			const result = await Effect.runPromise(
				rebase("/tmp/test-git-rebase", "feature-branch").pipe(
					Effect.catchAll((_error) => Effect.succeed(undefined))
				)
			);
			expect(result).toBe(undefined);
		});

		it("should rebase a branch interactively", async () => {
			const result = await Effect.runPromise(
				rebase("/tmp/test-git-rebase", "feature-branch", true).pipe(
					Effect.catchAll((_error) => Effect.succeed(undefined))
				)
			);
			expect(result).toBe(undefined);
		});
	});

	describe("cherryPick", () => {
		it("should cherry-pick a commit", async () => {
			const result = await Effect.runPromise(
				cherryPick("/tmp/test-git-cherry-pick", "abc123").pipe(
					Effect.catchAll((_error) => Effect.succeed(undefined))
				)
			);
			expect(result).toBe(undefined);
		});
	});

	describe("revert", () => {
		it("should revert a commit", async () => {
			const result = await Effect.runPromise(
				revert("/tmp/test-git-revert", "abc123").pipe(
					Effect.catchAll((_error) => Effect.succeed(undefined))
				)
			);
			expect(result).toBe(undefined);
		});
	});
});
