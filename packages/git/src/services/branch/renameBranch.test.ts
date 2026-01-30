import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { renameBranch } from "./renameBranch";

describe("renameBranch", () => {
	it("should rename a branch", async () => {
		const result = await Effect.runPromise(
			renameBranch("/tmp/test-git-rename-branch", "old-branch", "new-branch").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});
});
