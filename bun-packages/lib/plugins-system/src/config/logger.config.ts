/**
 * Plugin System Logger Configuration
 */

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface PluginLogger {
	readonly trace: (message: string, context?: Record<string, unknown>) => void;
	readonly debug: (message: string, context?: Record<string, unknown>) => void;
	readonly info: (message: string, context?: Record<string, unknown>) => void;
	readonly warn: (message: string, context?: Record<string, unknown>) => void;
	readonly error: (
		message: string,
		error?: unknown,
		context?: Record<string, unknown>,
	) => void;
	readonly fatal: (
		message: string,
		error?: unknown,
		context?: Record<string, unknown>,
	) => void;
}

export interface PluginLoggerConfig {
	readonly level: LogLevel;
	readonly pretty?: boolean;
	readonly prefix?: string;
	readonly enabled?: boolean;
}

export const DEFAULT_LOGGER_CONFIG: PluginLoggerConfig = {
	enabled: true,
	level: "info",
	prefix: "[plugin-system]",
	pretty: true,
};

const LOG_LEVELS: Record<LogLevel, number> = {
	trace: 0,
	debug: 1,
	info: 2,
	warn: 3,
	error: 4,
	fatal: 5,
};

/**
 * Create simple console logger for plugin system
 */
export const createPluginLogger = (
	config: Partial<PluginLoggerConfig> = {},
): PluginLogger => {
	const finalConfig = { ...DEFAULT_LOGGER_CONFIG, ...config };
	const minLevel = LOG_LEVELS[finalConfig.level];

	const shouldLog = (level: LogLevel): boolean => {
		if (!finalConfig.enabled) return false;
		return LOG_LEVELS[level] >= minLevel;
	};

	const formatMessage = (
		level: LogLevel,
		message: string,
		context?: Record<string, unknown>,
		error?: unknown,
	): string => {
		const timestamp = new Date().toISOString();
		const prefix = finalConfig.prefix || "[plugin-system]";
		const levelUpper = level.toUpperCase().padEnd(5);

		if (!finalConfig.pretty) {
			return JSON.stringify({
				timestamp,
				level,
				prefix,
				message,
				context,
				error: error instanceof Error ? error.message : error,
			});
		}

		let formatted = `${timestamp} ${levelUpper} ${prefix} ${message}`;
		if (context && Object.keys(context).length > 0) {
			formatted += ` ${JSON.stringify(context)}`;
		}
		if (error) {
			const errText = error instanceof Error
				? (error.stack ?? error.message)
				: typeof error === "string"
				? error
				: (() => {
					try {
						return JSON.stringify(error);
					} catch {
						return "Unknown error";
					}
				})();
			formatted += `\n${errText}`;
		}
		return formatted;
	};

	const log = (
		level: LogLevel,
		message: string,
		contextOrError?: unknown,
		maybeContext?: Record<string, unknown>,
	): void => {
		if (!shouldLog(level)) return;

		let context: Record<string, unknown> | undefined;
		let error: unknown;

		if (level === "error" || level === "fatal") {
			error = contextOrError;
			context = maybeContext;
		} else {
			context = contextOrError as Record<string, unknown> | undefined;
		}

		const formatted = formatMessage(level, message, context, error);
		const logFn = level === "error" || level === "fatal"
			? console.error
			: level === "warn"
			? console.warn
			: console.log;

		logFn(formatted);
	};

	return Object.freeze({
		trace: (msg: string, ctx?: Record<string, unknown>) => log("trace", msg, ctx),
		debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
		info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
		warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
		error: (msg: string, err?: unknown, ctx?: Record<string, unknown>) => log("error", msg, err, ctx),
		fatal: (msg: string, err?: unknown, ctx?: Record<string, unknown>) => log("fatal", msg, err, ctx),
	});
};
