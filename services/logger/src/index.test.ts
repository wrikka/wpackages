import { describe, expect, test, vi } from "vitest";
import { Effect, Layer } from "@wts/functional";
import { Logger, LoggerLive, info } from "./index";

describe("@wts/logger", () => {
	test("LoggerLive should redact default keys", async () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => {});

		const program = info("hello", { token: "abc" });
		const result = await Effect.runPromiseEither(Effect.provideLayer(program, LoggerLive));
		expect(result._tag).toBe("Right");
		const first = spy.mock.calls[0]?.[0];
		expect(typeof first).toBe("string");
		if (typeof first !== "string") throw new Error("Expected string");
		expect(first).toContain("[REDACTED]");

		spy.mockRestore();
	});

	test("custom logger should be injectable", async () => {
		const logs: unknown[] = [];
		const TestLogger = Layer.succeed(Logger, {
			log: (entry) =>
				Effect.fromPromise(async () => {
					logs.push(entry);
				}),
		});

		const program = info("x");
		const result = await Effect.runPromiseEither(Effect.provideLayer(program, TestLogger));
		expect(result._tag).toBe("Right");
		expect(logs.length).toBe(1);
	});
});
