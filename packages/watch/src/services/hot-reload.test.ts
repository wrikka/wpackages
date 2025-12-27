import { describe, expect, it, vi } from "vitest";
import type { WatchEvent } from "../types";
import { HotReloadService } from "./hot-reload";

describe("HotReloadService", () => {
	const createMockEvent = (): WatchEvent => ({
		type: "change",
		path: "/test/file.ts",
		timestamp: Date.now(),
	});

	describe("onReload", () => {
		it("should register reload callbacks", () => {
			const service = new HotReloadService();
			const callback = vi.fn();

			service.onReload(callback);
			expect(callback).not.toHaveBeenCalled();
		});

		it("should support multiple callbacks", () => {
			const service = new HotReloadService();
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			service.onReload(callback1);
			service.onReload(callback2);

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe("triggerReload", () => {
		it("should trigger registered callbacks after debounce", async () => {
			vi.useFakeTimers();
			const service = new HotReloadService(100);
			const callback = vi.fn();

			service.onReload(callback);
			const event = createMockEvent();
			service.triggerReload(event);

			expect(callback).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);
			await vi.runAllTimersAsync();

			expect(callback).toHaveBeenCalledWith(event);
			vi.useRealTimers();
		});

		it("should debounce multiple triggers", async () => {
			vi.useFakeTimers();
			const service = new HotReloadService(100);
			const callback = vi.fn();

			service.onReload(callback);

			service.triggerReload(createMockEvent());
			vi.advanceTimersByTime(50);
			service.triggerReload(createMockEvent());
			vi.advanceTimersByTime(50);
			service.triggerReload(createMockEvent());

			vi.advanceTimersByTime(100);
			await vi.runAllTimersAsync();

			expect(callback).toHaveBeenCalledTimes(1);
			vi.useRealTimers();
		});

		it("should handle async callbacks", async () => {
			vi.useFakeTimers();
			const service = new HotReloadService(100);
			const callback = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 50));
			});

			service.onReload(callback);
			service.triggerReload(createMockEvent());

			vi.advanceTimersByTime(100);
			await vi.runAllTimersAsync();

			expect(callback).toHaveBeenCalled();
			vi.useRealTimers();
		});

		it("should handle callback errors gracefully", async () => {
			vi.useFakeTimers();
			const service = new HotReloadService(100);
			const errorCallback = vi.fn(() => {
				throw new Error("Callback error");
			});
			const normalCallback = vi.fn();

			service.onReload(errorCallback);
			service.onReload(normalCallback);

			service.triggerReload(createMockEvent());

			vi.advanceTimersByTime(100);
			await vi.runAllTimersAsync();

			expect(errorCallback).toHaveBeenCalled();
			expect(normalCallback).toHaveBeenCalled();
			vi.useRealTimers();
		});
	});

	describe("isReloadingNow", () => {
		it("should return false when not reloading", () => {
			const service = new HotReloadService();
			expect(service.isReloadingNow()).toBe(false);
		});

		it("should return true during reload", async () => {
			vi.useFakeTimers();
			const service = new HotReloadService(100);
			const callback = vi.fn(async () => {
				expect(service.isReloadingNow()).toBe(true);
			});

			service.onReload(callback);
			service.triggerReload(createMockEvent());

			vi.advanceTimersByTime(100);
			await vi.runAllTimersAsync();

			expect(service.isReloadingNow()).toBe(false);
			vi.useRealTimers();
		});
	});

	describe("clearCallbacks", () => {
		it("should clear all registered callbacks", async () => {
			vi.useFakeTimers();
			const service = new HotReloadService(100);
			const callback = vi.fn();

			service.onReload(callback);
			service.clearCallbacks();
			service.triggerReload(createMockEvent());

			vi.advanceTimersByTime(100);
			await vi.runAllTimersAsync();

			expect(callback).not.toHaveBeenCalled();
			vi.useRealTimers();
		});
	});
});
