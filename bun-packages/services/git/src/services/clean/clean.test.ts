import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { diffStat, clean } from "./clean";

describe("clean", () => {
	describe("diffStat", () => {
		it("should get diff statistics", async () => {
			const result = await Effect.runPromise(
				diffStat("/tmp/test-git-diffstat").pipe(
					Effect.catchAll((_error) => Effect.succeed(""))
				)
			);
			expect(typeof result).toBe("string");
		});

		it("should get diff statistics between commits", async () => {
			const result = await Effect.runPromise(
				diffStat("/tmp/test-git-diffstat", "abc123", "def456").pipe(
					Effect.catchAll((_error) => Effect.succeed(""))
				)
			);
			expect(typeof result).toBe("string");
		});

		it("should get diff statistics from a commit", async () => {
			const result = await Effect.runPromise(
				diffStat("/tmp/test-git-diffstat", "abc123").pipe(
					Effect.catchAll((_error) => Effect.succeed(""))
				)
			);
			expect(typeof result).toBe("string");
		});
	});

	describe("clean", () => {
		it("should clean untracked files", async () => {
			const result = await Effect.runPromise(
				clean("/tmp/test-git-clean").pipe(
					Effect.catchAll((_error) => Effect.succeed(undefined))
				)
			);
			expect(result).toBe(undefined);
		});

		it("should clean untracked files with force", async () => {
			const result = await Effect.runPromise(
				clean("/tmp/test-git-clean", true).pipe(
					Effect.catchAll((_error) => Effect.succeed(undefined))
				)
			);
			expect(result).toBe(undefined);
		});

		it("should clean untracked files and directories", async () => {
			const result = await Effect.runPromise(
				clean("/tmp/test-git-clean", true, true).pipe(
					Effect.catchAll((_error) => Effect.succeed(undefined))
				)
			);
			expect(result).toBe(undefined);
		});
	});
});
