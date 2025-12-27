import { describe, expect, it, vi } from "vitest";
import { createEventEmitter } from "./event-emitter";

describe("createEventEmitter", () => {
	describe("on", () => {
		it("should register event handlers", () => {
			const emitter = createEventEmitter();
			const handler = vi.fn();

			emitter.on("test", handler);
			expect(emitter.listenerCount("test")).toBe(1);
		});

		it("should support multiple handlers for the same event", () => {
			const emitter = createEventEmitter();
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			emitter.on("test", handler1);
			emitter.on("test", handler2);
			expect(emitter.listenerCount("test")).toBe(2);
		});
	});

	describe("emit", () => {
		it("should call all registered handlers", async () => {
			const emitter = createEventEmitter();
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			emitter.on("test", handler1);
			emitter.on("test", handler2);

			await emitter.emit("test", { data: "value" });

			expect(handler1).toHaveBeenCalledWith({ data: "value" });
			expect(handler2).toHaveBeenCalledWith({ data: "value" });
		});

		it("should not call handlers for unregistered events", async () => {
			const emitter = createEventEmitter();
			const handler = vi.fn();

			emitter.on("test", handler);
			await emitter.emit("other", {});

			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe("once", () => {
		it("should call handler only once", async () => {
			const emitter = createEventEmitter();
			const handler = vi.fn();

			emitter.once("test", handler);
			await emitter.emit("test", { data: 1 });
			await emitter.emit("test", { data: 2 });

			expect(handler).toHaveBeenCalledTimes(1);
			expect(handler).toHaveBeenCalledWith({ data: 1 });
		});
	});

	describe("off", () => {
		it("should remove specific handler", async () => {
			const emitter = createEventEmitter();
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			emitter.on("test", handler1);
			emitter.on("test", handler2);
			emitter.off("test", handler1);

			await emitter.emit("test", {});

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).toHaveBeenCalled();
		});

		it("should remove all handlers when no handler specified", async () => {
			const emitter = createEventEmitter();
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			emitter.on("test", handler1);
			emitter.on("test", handler2);
			emitter.off("test");

			await emitter.emit("test", {});

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
		});
	});

	describe("removeAllListeners", () => {
		it("should remove all listeners", async () => {
			const emitter = createEventEmitter();
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			emitter.on("test1", handler1);
			emitter.on("test2", handler2);
			emitter.removeAllListeners();

			await emitter.emit("test1", {});
			await emitter.emit("test2", {});

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
		});
	});

	describe("listenerCount", () => {
		it("should return the count of listeners for an event", () => {
			const emitter = createEventEmitter();
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			emitter.on("test", handler1);
			emitter.on("test", handler2);

			expect(emitter.listenerCount("test")).toBe(2);
			expect(emitter.listenerCount("other")).toBe(0);
		});
	});
});
