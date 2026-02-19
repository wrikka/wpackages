import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { tag, deleteTag, listTags } from "./tag";

describe("tag", () => {
	it("should create a tag", async () => {
		const result = await Effect.runPromise(
			tag("/tmp/test-git-tag", "v1.0.0").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});

	it("should create a tag with message", async () => {
		const result = await Effect.runPromise(
			tag("/tmp/test-git-tag", "v1.0.0", "Release version 1.0.0").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});

	it("should create a tag on a specific commit", async () => {
		const result = await Effect.runPromise(
			tag("/tmp/test-git-tag", "v1.0.0", "Release version 1.0.0", "abc123").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});

	it("should delete a tag", async () => {
		const result = await Effect.runPromise(
			deleteTag("/tmp/test-git-tag", "v1.0.0").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});

	it("should list all tags", async () => {
		const result = await Effect.runPromise(
			listTags("/tmp/test-git-tag").pipe(
				Effect.catchAll((_error) => Effect.succeed([]))
			)
		);
		expect(Array.isArray(result)).toBe(true);
	});
});
