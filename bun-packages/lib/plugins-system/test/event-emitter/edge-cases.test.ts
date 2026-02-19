import { describe, expect, it, vi } from "vitest";
import type { PluginEvent } from "../../src/types";
import { createEventEmitter } from "../../src/utils/event-emitter.utils";

describe("Event Emitter - Edge Cases", () => {
	it("should handle emitting to event with no handlers", async () => {
		const emitter = createEventEmitter();

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await expect(emitter.emit(event)).resolves.not.toThrow();
	});

	it("should handle async handlers", async () => {
		const emitter = createEventEmitter();
		const handler = vi.fn(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
		});

		emitter.on("plugin:installed", handler);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);

		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("should handle handlers that throw errors", async () => {
		const emitter = createEventEmitter();
		const errorHandler = vi.fn(() => {
			throw new Error("Handler error");
		});
		const normalHandler = vi.fn();

		emitter.on("plugin:installed", errorHandler);
		emitter.on("plugin:installed", normalHandler);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		// Should reject because one handler throws
		await expect(emitter.emit(event)).rejects.toThrow("Handler error");
		expect(errorHandler).toHaveBeenCalledTimes(1);
	});
});
