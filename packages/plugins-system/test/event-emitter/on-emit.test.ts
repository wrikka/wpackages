import { describe, expect, it, vi } from "vitest";
import type { PluginEvent } from "../../src/types";
import { createEventEmitter } from "../../src/utils/event-emitter.utils";

describe("Event Emitter - on and emit", () => {
	it("should register and emit events", async () => {
		const emitter = createEventEmitter();
		const handler = vi.fn();

		emitter.on("plugin:installed", handler);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);

		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler).toHaveBeenCalledWith(event);
	});

	it("should handle multiple handlers for same event", async () => {
		const emitter = createEventEmitter();
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		emitter.on("plugin:installed", handler1);
		emitter.on("plugin:installed", handler2);

		const event: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);

		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler2).toHaveBeenCalledTimes(1);
	});

	it("should handle multiple event types", async () => {
		const emitter = createEventEmitter();
		const installedHandler = vi.fn();
		const enabledHandler = vi.fn();

		emitter.on("plugin:installed", installedHandler);
		emitter.on("plugin:enabled", enabledHandler);

		const installedEvent: PluginEvent = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		const enabledEvent: PluginEvent = {
			type: "plugin:enabled",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(installedEvent);
		await emitter.emit(enabledEvent);

		expect(installedHandler).toHaveBeenCalledTimes(1);
		expect(enabledHandler).toHaveBeenCalledTimes(1);
	});

	it("should not call handlers for different event types", async () => {
		const emitter = createEventEmitter();
		const handler = vi.fn();

		emitter.on("plugin:installed", handler);

		const event: PluginEvent = {
			type: "plugin:enabled",
			pluginId: "test-plugin",
			timestamp: new Date(),
		};

		await emitter.emit(event);

		expect(handler).not.toHaveBeenCalled();
	});

	it("should handle events with data", async () => {
		const emitter = createEventEmitter();
		const handler = vi.fn();

		emitter.on("plugin:installed", handler);

		const event: PluginEvent<{ version: string }> = {
			type: "plugin:installed",
			pluginId: "test-plugin",
			timestamp: new Date(),
			data: { version: "1.0.0" },
		};

		await emitter.emit(event);

		expect(handler).toHaveBeenCalledWith(event);
		expect(handler.mock.calls[0][0].data).toEqual({ version: "1.0.0" });
	});
});
