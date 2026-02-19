import { describe, expect, it, vi } from "vitest";
import type { PluginEvent } from "../../src/types";
import { createEventEmitter } from "../../src/utils/event-emitter.utils";

describe("Event Emitter - once", () => {
	it("should call handler only once", async () => {
		const emitter = createEventEmitter();
		const handler = vi.fn();

		emitter.once("plugin:installed", handler);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);
		await emitter.emit(event);

		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("should work with multiple once handlers", async () => {
		const emitter = createEventEmitter();
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		emitter.once("plugin:installed", handler1);
		emitter.once("plugin:installed", handler2);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);

		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler2).toHaveBeenCalledTimes(1);

		await emitter.emit(event);

		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler2).toHaveBeenCalledTimes(1);
	});

	it("should allow removing once handler with off", async () => {
		const emitter = createEventEmitter();
		const handler = vi.fn();

		emitter.once("plugin:installed", handler);
		emitter.off("plugin:installed", handler);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);

		expect(handler).not.toHaveBeenCalled();
	});

	it("should work alongside regular handlers", async () => {
		const emitter = createEventEmitter();
		const onceHandler = vi.fn();
		const regularHandler = vi.fn();

		emitter.once("plugin:installed", onceHandler);
		emitter.on("plugin:installed", regularHandler);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);
		await emitter.emit(event);

		expect(onceHandler).toHaveBeenCalledTimes(1);
		expect(regularHandler).toHaveBeenCalledTimes(2);
	});
});
