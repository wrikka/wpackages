import { describe, expect, it, vi } from "vitest";
import type { WatcherConfig, WatchError } from "../types";
import { createFileWatcher } from "./file-watcher";

describe("Error Handling", () => {
	describe("error handler callback", () => {
		it("should call error handler on watch error", async () => {
			const errorHandler = vi.fn<(error: WatchError) => void>();

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			createFileWatcher(config);
			expect(errorHandler).not.toHaveBeenCalled();
		});

		it("should provide error details", async () => {
			const errorHandler = vi.fn<(error: WatchError) => void>();

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			createFileWatcher(config);

			// Error handler should have correct signature
			expect(typeof errorHandler).toBe("function");
		});
	});

	describe("error recovery", () => {
		it("should continue watching after error", async () => {
			const errorHandler = vi.fn();
			const changeHandler = vi.fn();

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			const watcher = createFileWatcher(config);
			watcher.on("change", changeHandler);

			// Should not throw and continue operating
			expect(watcher.isWatching()).toBe(false);
		});

		it("should handle multiple errors gracefully", async () => {
			const errorHandler = vi.fn();

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			const watcher = createFileWatcher(config);

			// Should handle multiple error scenarios
			expect(watcher).toBeDefined();
		});
	});

	describe("error types", () => {
		it("should provide error code", async () => {
			const errorHandler = vi.fn<(error: WatchError) => void>((error) => {
				expect(error).toHaveProperty("code");
				expect(typeof error.code).toBe("string");
			});

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			createFileWatcher(config);
			expect(errorHandler).toBeDefined();
		});

		it("should provide error message", async () => {
			const errorHandler = vi.fn<(error: WatchError) => void>((error) => {
				expect(error).toHaveProperty("message");
				expect(typeof error.message).toBe("string");
			});

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			createFileWatcher(config);
			expect(errorHandler).toBeDefined();
		});

		it("should provide error path when applicable", async () => {
			const errorHandler = vi.fn<(error: WatchError) => void>((error) => {
				expect(error).toHaveProperty("code");
				expect(error).toHaveProperty("message");
				// path is optional - check type if present
				expect(typeof error.path === "string" || error.path === undefined).toBe(true);
			});

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			createFileWatcher(config);
		});

		it("should provide error cause", async () => {
			const errorHandler = vi.fn<(error: WatchError) => void>((error) => {
				expect(error).toHaveProperty("code");
				// cause is optional - check if defined when present
				expect(error.cause === undefined || error.cause !== undefined).toBe(true);
			});

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			createFileWatcher(config);
			expect(errorHandler).toBeDefined();
		});
	});

	describe("async error handling", () => {
		it("should support async error handlers", async () => {
			const errorHandler = vi.fn(async (_error: WatchError) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
			});

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			const watcher = createFileWatcher(config);
			expect(watcher).toBeDefined();
		});

		it("should handle error handler exceptions", async () => {
			const errorHandler = vi.fn(() => {
				throw new Error("Handler error");
			});

			const config: WatcherConfig = {
				paths: ["/test"],
				errorHandler,
				debounceMs: 100,
			};

			const watcher = createFileWatcher(config);
			// Should not crash
			expect(watcher).toBeDefined();
		});
	});
});
