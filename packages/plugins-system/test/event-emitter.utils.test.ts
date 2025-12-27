/**
 * Event Emitter Utils Tests
 */

import { describe, expect, it, vi } from "vitest";
import type { PluginEvent } from "../src/types";
import { createEventEmitter } from "../src/utils/event-emitter.utils";

describe("Event Emitter Utils", () => {
	describe("createEventEmitter", () => {
		it("should create an event emitter", () => {
			const emitter = createEventEmitter();

			expect(emitter).toBeDefined();
			expect(emitter.on).toBeDefined();
			expect(emitter.off).toBeDefined();
			expect(emitter.emit).toBeDefined();
			expect(emitter.once).toBeDefined();
		});

		it("should be frozen", () => {
			const emitter = createEventEmitter();
			expect(Object.isFrozen(emitter)).toBe(true);
		});
	});

	describe("on and emit", () => {
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

	describe("off", () => {
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

	describe("once", () => {
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

	describe("edge cases", () => {
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
});
