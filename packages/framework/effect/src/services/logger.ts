export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
	readonly timestamp: number;
	readonly level: LogLevel;
	readonly message: string;
	readonly context?: Record<string, unknown>;
	readonly error?: Error;
	readonly fiberId?: number;
	readonly traceId?: string;
}

export interface LoggerConfig {
	readonly minLevel: LogLevel;
	readonly enabled: boolean;
	readonly output: "console" | "custom";
	readonly formatter?: (entry: LogEntry) => string;
	readonly customHandler?: (entry: LogEntry) => void;
}

export interface Logger {
	readonly debug: (message: string, context?: Record<string, unknown>) => void;
	readonly info: (message: string, context?: Record<string, unknown>) => void;
	readonly warn: (message: string, context?: Record<string, unknown>) => void;
	readonly error: (message: string, error?: Error, context?: Record<string, unknown>) => void;
	readonly fatal: (message: string, error?: Error, context?: Record<string, unknown>) => void;
	readonly withContext: (context: Record<string, unknown>) => Logger;
	readonly child: (name: string) => Logger;
}

import type { Effect, LogEntry, Logger, LoggerConfig, LogLevel } from "../types";

import type { Effect, LogEntry, Logger, LoggerConfig, LogLevel } from "../types";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
	fatal: 4,
};

const defaultConfig: LoggerConfig = {
	minLevel: "info",
	enabled: true,
	output: "console",
};

let globalConfig: LoggerConfig = { ...defaultConfig };

const formatMessage = (entry: LogEntry): string => {
	const timestamp = new Date(entry.timestamp).toISOString();
	const fiberInfo = entry.fiberId ? ` [fiber:${entry.fiberId}]` : "";
	const traceInfo = entry.traceId ? ` [trace:${entry.traceId}]` : "";
	let message = `[${timestamp}]${fiberInfo}${traceInfo} [${entry.level.toUpperCase()}] ${entry.message}`;

	if (entry.context && Object.keys(entry.context).length > 0) {
		message += ` ${JSON.stringify(entry.context)}`;
	}

	if (entry.error) {
		message += ` \nError: ${entry.error.message}`;
		if (entry.error.stack) {
			message += ` \n${entry.error.stack}`;
		}
	}

	return message;
};

const shouldLog = (level: LogLevel): boolean => {
	if (!globalConfig.enabled) return false;
	return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[globalConfig.minLevel];
};

const createLogEntry = (
	level: LogLevel,
	message: string,
	context?: Record<string, unknown>,
	error?: Error,
	fiberId?: number,
	traceId?: string,
): LogEntry => ({
	timestamp: Date.now(),
	level,
	message,
	context,
	error,
	fiberId,
	traceId,
});

const outputLog = (entry: LogEntry): void => {
	if (globalConfig.output === "custom" && globalConfig.customHandler) {
		globalConfig.customHandler(entry);
		return;
	}

	const formatted = globalConfig.formatter ? globalConfig.formatter(entry) : formatMessage(entry);

	switch (entry.level) {
		case "debug":
			console.debug(formatted);
			break;
		case "info":
			console.info(formatted);
			break;
		case "warn":
			console.warn(formatted);
			break;
		case "error":
		case "fatal":
			console.error(formatted);
			break;
	}
};

const createLogger = (
	baseContext: Record<string, unknown> = {},
	name?: string,
	fiberId?: number,
	traceId?: string,
): Logger => {
	const log = (level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) => {
		if (!shouldLog(level)) return;

		const mergedContext = { ...baseContext, ...context };
		if (name) {
			mergedContext.logger = name;
		}

		const entry = createLogEntry(level, message, mergedContext, error, fiberId, traceId);
		outputLog(entry);
	};

	return {
		debug: (message, context) => log("debug", message, context),
		info: (message, context) => log("info", message, context),
		warn: (message, context) => log("warn", message, context),
		error: (message, error, context) => log("error", message, context, error),
		fatal: (message, error, context) => log("fatal", message, context, error),
		withContext: (newContext) => createLogger({ ...baseContext, ...newContext }, name, fiberId, traceId),
		child: (childName) => createLogger(baseContext, childName, fiberId, traceId),
	};
};

export const setLoggerConfig = (config: Partial<LoggerConfig>): void => {
	globalConfig = { ...globalConfig, ...config };
};

export const getLoggerConfig = (): LoggerConfig => ({ ...globalConfig });

export const resetLoggerConfig = (): void => {
	globalConfig = { ...defaultConfig };
};

export const logger = createLogger();

export const createEffectLogger = (fiberId?: number, traceId?: string): Logger =>
	createLogger({}, undefined, fiberId, traceId);

export const withLogging = <A, E>(
	effect: Effect<A, E>,
	logMessage: string,
	level: LogLevel = "info",
): Effect<A, E> => {
	return async () => {
		if (shouldLog(level)) {
			const entry = createLogEntry(level, `Starting: ${logMessage}`);
			outputLog(entry);
		}

		try {
			const result = await effect();
			if (shouldLog(level)) {
				const entry = createLogEntry(level, `Completed: ${logMessage}`);
				outputLog(entry);
			}
			return result;
		} catch (error) {
			if (shouldLog("error")) {
				const entry = createLogEntry("error", `Failed: ${logMessage}`, undefined, error as Error);
				outputLog(entry);
			}
			throw error;
		}
	};
};

export const logEffectError = <A, E>(
	effect: Effect<A, E>,
	errorMessage: string,
): Effect<A, E> => {
	return async () => {
		try {
			return await effect();
		} catch (error) {
			if (shouldLog("error")) {
				const entry = createLogEntry("error", errorMessage, undefined, error as Error);
				outputLog(entry);
			}
			throw error;
		}
	};
};
