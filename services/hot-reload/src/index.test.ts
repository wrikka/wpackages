import { Effect } from "@wts/functional";
import { describe, expect, test } from "vitest";
import { HotReloadLive, watch } from "./index";

describe("@wts/hot-reload", () => {
	test("watch should return an async iterable", async () => {
		const program = watch([process.cwd()]);
		const result = await Effect.runPromiseEither(Effect.provideLayer(program, HotReloadLive));
		expect(result._tag).toBe("Right");
		if (result._tag !== "Right") throw new Error("Expected Right");
		expect(typeof (result.right as any)[Symbol.asyncIterator]).toBe("function");
	});
});
