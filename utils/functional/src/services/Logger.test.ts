import { Effect } from "effect";
import { describe, expect, it, vi } from "vitest";
import { Logger } from "./Logger";
import { LoggerLive } from "./logger.service";

describe("LoggerLive", () => {
	it("should call console.log with the provided message", async () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		try {
			await Effect.runPromise(
				Effect.gen(function*(_) {
					const logger = yield* _(Logger);
					yield* logger.log("hello");
				}).pipe(Effect.provide(LoggerLive)),
			);
			expect(spy).toHaveBeenCalledWith("hello");
		} finally {
			spy.mockRestore();
		}
	});
});
