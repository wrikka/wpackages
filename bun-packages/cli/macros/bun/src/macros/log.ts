/**
 * Compile-time logging with automatic source location.
 * Includes the file path and line number where the log is called.
 *
 * @param args - Values to log
 * @returns A console.log statement with source location
 *
 * @example
 * ```typescript
 * log("Hello, world!");
 * log("User:", user);
 * log("Processing", items.length, "items");
 * ```
 */
export const log = Bun.macro((...args: readonly unknown[]) => {
	const line = import.meta.line ?? 0;
	const path = import.meta.path ?? "";
	return `console.log("[${path}:${line}]", ...${JSON.stringify(args)})`;
});

/**
 * Compile-time debug logging with automatic source location.
 * Uses console.debug for debug-level messages.
 *
 * @param args - Values to log
 * @returns A console.debug statement with source location
 *
 * @example
 * ```typescript
 * log.debug("Debug info:", data);
 * log.debug("Variable value:", variable);
 * ```
 */
export const debug = Bun.macro((...args: readonly unknown[]) => {
	const line = import.meta.line ?? 0;
	const path = import.meta.path ?? "";
	return `console.debug("[${path}:${line}] DEBUG:", ...${JSON.stringify(args)})`;
});

/**
 * Compile-time info logging with automatic source location.
 * Uses console.info for info-level messages.
 *
 * @param args - Values to log
 * @returns A console.info statement with source location
 *
 * @example
 * ```typescript
 * log.info("Server started on port", port);
 * log.info("Processing", count, "items");
 * ```
 */
export const info = Bun.macro((...args: readonly unknown[]) => {
	const line = import.meta.line ?? 0;
	const path = import.meta.path ?? "";
	return `console.info("[${path}:${line}] INFO:", ...${JSON.stringify(args)})`;
});

/**
 * Compile-time warning logging with automatic source location.
 * Uses console.warn for warning-level messages.
 *
 * @param args - Values to log
 * @returns A console.warn statement with source location
 *
 * @example
 * ```typescript
 * log.warn("Deprecated API usage");
 * log.warn("Rate limit approaching:", remaining);
 * ```
 */
export const warn = Bun.macro((...args: readonly unknown[]) => {
	const line = import.meta.line ?? 0;
	const path = import.meta.path ?? "";
	return `console.warn("[${path}:${line}] WARN:", ...${JSON.stringify(args)})`;
});

/**
 * Compile-time error logging with automatic source location.
 * Uses console.error for error-level messages.
 *
 * @param args - Values to log
 * @returns A console.error statement with source location
 *
 * @example
 * ```typescript
 * log.error("Failed to connect:", error);
 * log.error("Invalid input:", input);
 * ```
 */
export const error = Bun.macro((...args: readonly unknown[]) => {
	const line = import.meta.line ?? 0;
	const path = import.meta.path ?? "";
	return `console.error("[${path}:${line}] ERROR:", ...${JSON.stringify(args)})`;
});

/**
 * Log levels object containing all log level methods.
 *
 * @example
 * ```typescript
 * log.debug("Debug message");
 * log.info("Info message");
 * log.warn("Warning message");
 * log.error("Error message");
 * ```
 */
export const logLevels = {
	debug,
	info,
	warn,
	error,
};

// Attach log levels to log object
Object.assign(log, logLevels);
