import { describe, expect, it, vi } from "vitest";
import type { PluginEvent } from "../types";
import { createEventEmitter } from "./event-emitter.utils";

describe("event-emitter.utils", () => {
	describe("createEventEmitter", () => {
		it("should create event emitter with all methods", () => {
			const emitter = createEventEmitter();

			expect(emitter).toHaveProperty("on");
			expect(emitter).toHaveProperty("off");
			expect(emitter).toHaveProperty("emit");
			expect(emitter).toHaveProperty("once");
			expect(Object.isFrozen(emitter)).toBe(true);
		});

		it("should register and trigger event handler", async () => {
			const emitter = createEventEmitter();
			const handler = vi.fn();

			emitter.on("test", handler);

			const event: PluginEvent = {
				type: "test",
				pluginId: "test-plugin",
				timestamp: new Date(),
			};

			await emitter.emit(event);

			expect(handler).toHaveBeenCalledWith(event);
			expect(handler).toHaveBeenCalledTimes(1);
		});

		it("should trigger multiple handlers for same event", async () => {
			const emitter = createEventEmitter();
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			emitter.on("test", handler1);
			emitter.on("test", handler2);

			const event: PluginEvent = {
				type: "test",
				pluginId: "test-plugin",
				timestamp: new Date(),
			};

			await emitter.emit(event);

			expect(handler1).toHaveBeenCalledWith(event);
			expect(handler2).toHaveBeenCalledWith(event);
		});

		it("should remove event handler", async () => {
			const emitter = createEventEmitter();
			const handler = vi.fn();

			emitter.on("test", handler);
			emitter.off("test", handler);

			const event: PluginEvent = {
				type: "test",
				pluginId: "test-plugin",
				timestamp: new Date(),
			};

			await emitter.emit(event);

			expect(handler).not.toHaveBeenCalled();
		});

		it("should trigger once handler only once", async () => {
			const emitter = createEventEmitter();
			const handler = vi.fn();

			emitter.once("test", handler);

			const event: PluginEvent = {
				type: "test",
				pluginId: "test-plugin",
				timestamp: new Date(),
			};

			await emitter.emit(event);
			await emitter.emit(event);

			expect(handler).toHaveBeenCalledTimes(1);
		});

		it("should handle events with data", async () => {
			const emitter = createEventEmitter();
			const handler = vi.fn();

			emitter.on("test", handler);

			const event: PluginEvent<{ message: string }> = {
				type: "test",
				pluginId: "test-plugin",
				timestamp: new Date(),
				data: { message: "Hello" },
			};

			await emitter.emit(event);

			expect(handler).toHaveBeenCalledWith(event);
			expect(handler.mock.calls[0]?.[0]?.data).toEqual({ message: "Hello" });
		});

		it("should handle async handlers", async () => {
			const emitter = createEventEmitter();
			const results: number[] = [];

			const handler1 = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				results.push(1);
			});

			const handler2 = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 5));
				results.push(2);
			});

			emitter.on("test", handler1);
			emitter.on("test", handler2);

			const event: PluginEvent = {
				type: "test",
				pluginId: "test-plugin",
				timestamp: new Date(),
			};

			await emitter.emit(event);

			expect(handler1).toHaveBeenCalled();
			expect(handler2).toHaveBeenCalled();
			expect(results).toHaveLength(2);
		});

		it("should not throw when emitting event with no handlers", async () => {
			const emitter = createEventEmitter();

			const event: PluginEvent = {
				type: "test",
				pluginId: "test-plugin",
				timestamp: new Date(),
			};

			await expect(emitter.emit(event)).resolves.not.toThrow();
		});

		it("should handle removing handler that was registered with once", async () => {
			const emitter = createEventEmitter();
			const handler = vi.fn();

			emitter.once("test", handler);
			emitter.off("test", handler);

			const event: PluginEvent = {
				type: "test",
				pluginId: "test-plugin",
				timestamp: new Date(),
			};

			await emitter.emit(event);

			expect(handler).not.toHaveBeenCalled();
		});
	});
});
