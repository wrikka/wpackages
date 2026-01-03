/**
 * Tests for console service
 */

import { Effect } from "effect";
import { describe, expect, it, vi } from "vitest";
import { makeConsoleService } from "./console.service";

describe("ConsoleService", () => {
	it("should log messages", async () => {
		const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const service = makeConsoleService();

		await Effect.runPromise(service.log("Test message"));

		expect(consoleLogSpy).toHaveBeenCalledWith("Test message");
		consoleLogSpy.mockRestore();
	});

	it("should log multiple messages", async () => {
		const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const service = makeConsoleService();

		const program = Effect.gen(function*() {
			yield* service.log("Message 1");
			yield* service.log("Message 2");
			yield* service.log("Message 3");
		});

		await Effect.runPromise(program);

		expect(consoleLogSpy).toHaveBeenCalledTimes(3);
		expect(consoleLogSpy).toHaveBeenNthCalledWith(1, "Message 1");
		expect(consoleLogSpy).toHaveBeenNthCalledWith(2, "Message 2");
		expect(consoleLogSpy).toHaveBeenNthCalledWith(3, "Message 3");
		consoleLogSpy.mockRestore();
	});

	it("should return Effect type", () => {
		const service = makeConsoleService();
		const effect = service.log("test");

		expect(effect).toBeDefined();
		expect(typeof effect).toBe("object");
	});
});
