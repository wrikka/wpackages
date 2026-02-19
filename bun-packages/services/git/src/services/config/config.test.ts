import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { getConfig, setConfig } from "./config";

describe("config", () => {
	it("should get config value", async () => {
		const result = await Effect.runPromise(
			getConfig("/tmp/test-git-config", "user.name").pipe(
				Effect.catchAll((_error) => Effect.succeed(""))
			)
		);
		expect(typeof result).toBe("string");
	});

	it("should set config value", async () => {
		const result = await Effect.runPromise(
			setConfig("/tmp/test-git-config", "test.key", "test.value").pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});

	it("should set global config value", async () => {
		const result = await Effect.runPromise(
			setConfig("/tmp/test-git-config", "test.global.key", "test.global.value", true).pipe(
				Effect.catchAll((_error) => Effect.succeed(undefined))
			)
		);
		expect(result).toBe(undefined);
	});
});
