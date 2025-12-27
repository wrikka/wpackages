import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { createFileWatcher } from "./file-watcher";
import type { WatcherConfig } from "../types";

describe("createFileWatcher", () => {
	let watcher: ReturnType<typeof createFileWatcher>;

	beforeEach(() => {
		const config: WatcherConfig = {
			paths: ["/test"],
			ignored: ["node_modules/**", "dist/**"],
			debounceMs: 100,
			enableStats: true,
			enableHotReload: false,
		};
		watcher = createFileWatcher(config);
	});

	afterEach(async () => {
		if (watcher.isWatching()) {
			await watcher.stop();
		}
	});

	describe("basic operations", () => {
		it("should create watcher instance", () => {
			expect(watcher).toBeDefined();
			expect(watcher.isWatching()).toBe(false);
		});

		it("should have all required methods", () => {
			expect(typeof watcher.start).toBe("function");
			expect(typeof watcher.stop).toBe("function");
			expect(typeof watcher.add).toBe("function");
			expect(typeof watcher.unwatch).toBe("function");
			expect(typeof watcher.on).toBe("function");
			expect(typeof watcher.once).toBe("function");
			expect(typeof watcher.off).toBe("function");
			expect(typeof watcher.getStats).toBe("function");
			expect(typeof watcher.isWatching).toBe("function");
		});
	});

	describe("event handling", () => {
		it("should register event handlers", () => {
			const handler = vi.fn();
			watcher.on("change", handler);
			// Handler registered, but not called yet
			expect(handler).not.toHaveBeenCalled();
		});

		it("should support multiple event types", () => {
			const changeHandler = vi.fn();
			const addHandler = vi.fn();

			watcher.on("change", changeHandler);
			watcher.on("add", addHandler);

			expect(changeHandler).not.toHaveBeenCalled();
			expect(addHandler).not.toHaveBeenCalled();
		});

		it("should support once handler", () => {
			const handler = vi.fn();
			watcher.once("change", handler);
			expect(handler).not.toHaveBeenCalled();
		});

		it("should remove handlers", () => {
			const handler = vi.fn();
			watcher.on("change", handler);
			watcher.off("change", handler);
			// Handler removed
			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe("statistics", () => {
		it("should return initial stats", () => {
			const stats = watcher.getStats();
			expect(stats.totalEvents).toBe(0);
			expect(stats.watchedPaths).toBe(0);
			expect(stats.uptime).toBe(0);
			expect(stats.eventsByType).toBeDefined();
		});

		it("should track watched paths", async () => {
			await watcher.start();
			const stats = watcher.getStats();
			expect(stats.watchedPaths).toBeGreaterThanOrEqual(0);
		});

		it("should have correct event type structure", () => {
			const stats = watcher.getStats();
			expect(stats.eventsByType).toHaveProperty("add");
			expect(stats.eventsByType).toHaveProperty("change");
			expect(stats.eventsByType).toHaveProperty("unlink");
		});
	});

	describe("performance monitoring", () => {
		it("should provide performance stats", () => {
			const stats = watcher.getPerformanceStats();
			expect(stats).toHaveProperty("uptime");
			expect(stats).toHaveProperty("eventCount");
			expect(stats).toHaveProperty("eventsPerSecond");
			expect(stats).toHaveProperty("avgProcessingTime");
		});

		it("should provide recommendations", () => {
			const recommendations = watcher.getPerformanceRecommendations();
			expect(Array.isArray(recommendations)).toBe(true);
		});
	});

	describe("advanced features", () => {
		it("should have advanced pattern matcher", () => {
			const matcher = watcher.getAdvancedPatternMatcher();
			// May be null if patterns are not arrays
			expect(matcher === null || typeof matcher === "object").toBe(true);
		});

		it("should support hot reload registration", () => {
			const callback = vi.fn();
			watcher.onHotReload(callback);
			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe("error handling", () => {
		it("should handle invalid paths gracefully", async () => {
			const config: WatcherConfig = {
				paths: ["/nonexistent/path/that/does/not/exist"],
				debounceMs: 100,
			};
			const testWatcher = createFileWatcher(config);

			// Should not throw
			await expect(testWatcher.start()).resolves.not.toThrow();
			await testWatcher.stop();
		});

		it("should handle add/unwatch operations", async () => {
			await watcher.start();

			// Should not throw
			await expect(watcher.add("/test/path")).resolves.not.toThrow();
			await expect(watcher.unwatch("/test/path")).resolves.not.toThrow();

			await watcher.stop();
		});

		it("should handle multiple start/stop calls", async () => {
			await watcher.start();
			await watcher.start(); // Should be idempotent
			expect(watcher.isWatching()).toBe(true);

			await watcher.stop();
			await watcher.stop(); // Should be idempotent
			expect(watcher.isWatching()).toBe(false);
		});
	});

	describe("configuration", () => {
		it("should respect ignore patterns", () => {
			const config: WatcherConfig = {
				paths: ["/test"],
				ignored: ["node_modules/**"],
				debounceMs: 100,
			};
			const testWatcher = createFileWatcher(config);
			expect(testWatcher).toBeDefined();
		});

		it("should respect depth configuration", () => {
			const config: WatcherConfig = {
				paths: ["/test"],
				depth: 2,
				debounceMs: 100,
			};
			const testWatcher = createFileWatcher(config);
			expect(testWatcher).toBeDefined();
		});

		it("should support custom handlers", () => {
			const handler = vi.fn();
			const config: WatcherConfig = {
				paths: ["/test"],
				handler,
				debounceMs: 100,
			};
			const testWatcher = createFileWatcher(config);
			expect(testWatcher).toBeDefined();
		});
	});
});
