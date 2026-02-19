import { describe, it, expect } from "vitest";
import { Effect } from "@wpackages/effect";
import { init } from "./init";

describe("init", () => {
	it("should initialize a git repository", async () => {
		const result = await Effect.runPromise(
			init("/tmp/test-git-init").pipe(
				Effect.catchAll((error) => Effect.succeed(error))
			)
		);
		expect(result).toBe(undefined);
	});
});
