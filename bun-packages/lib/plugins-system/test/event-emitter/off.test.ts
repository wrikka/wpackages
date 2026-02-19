import { describe, expect, it, vi } from "vitest";
import type { PluginEvent } from "../../src/types";
import { createEventEmitter } from "../../src/utils/event-emitter.utils";

describe("Event Emitter - off", () => {
	it("should remove event handler", async () => {
		const emitter = createEventEmitter();
		const handler = vi.fn();

		emitter.on("plugin:installed", handler);
		emitter.off("plugin:installed", handler);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);

		expect(handler).not.toHaveBeenCalled();
	});

	it("should only remove specified handler", async () => {
		const emitter = createEventEmitter();
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		emitter.on("plugin:installed", handler1);
		emitter.on("plugin:installed", handler2);
		emitter.off("plugin:installed", handler1);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);

		expect(handler1).not.toHaveBeenCalled();
		expect(handler2).toHaveBeenCalledTimes(1);
	});

	it("should handle removing non-existent handler", () => {
		const emitter = createEventEmitter();
		const handler = vi.fn();

		expect(() => {
			emitter.off("plugin:installed", handler);
		}).not.toThrow();
	});
});
