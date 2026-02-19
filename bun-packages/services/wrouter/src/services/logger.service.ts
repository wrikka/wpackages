import { Effect } from "effect";

export type LogLevel = "debug" | "info" | "warn" | "error";

export const log = (level: LogLevel, message: string, ...args: readonly unknown[]): Effect.Effect<void, never> =>
	Effect.sync(() => {
		const timestamp = new Date().toISOString();
		const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

		switch (level) {
			case "debug":
				console.debug(prefix, message, ...args);
				break;
			case "info":
				console.info(prefix, message, ...args);
				break;
			case "warn":
				console.warn(prefix, message, ...args);
				break;
			case "error":
				console.error(prefix, message, ...args);
				break;
		}
	});

export const debug = (message: string, ...args: readonly unknown[]): Effect.Effect<void, never> =>
	log("debug", message, ...args);

export const info = (message: string, ...args: readonly unknown[]): Effect.Effect<void, never> =>
	log("info", message, ...args);

export const warn = (message: string, ...args: readonly unknown[]): Effect.Effect<void, never> =>
	log("warn", message, ...args);

export const error = (message: string, ...args: readonly unknown[]): Effect.Effect<void, never> =>
	log("error", message, ...args);
