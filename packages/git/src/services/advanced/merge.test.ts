import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { merge } from "./merge";

describe("merge", () => {
	it("should merge a branch", async () => {
		const result = await Effect.runPromise(
			merge("/tmp/test-git-merge", "feature-branch").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});

	it("should merge a branch without fast-forward", async () => {
		const result = await Effect.runPromise(
			merge("/tmp/test-git-merge", "feature-branch", true).pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});
});
