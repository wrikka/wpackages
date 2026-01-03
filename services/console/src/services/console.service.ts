import { Effect, Layer } from "@wpackages/functional";
import type { Console as ConsoleService, ConsoleConfig, LogLevel, LogMessage } from "../types/index";
import { formatMessage } from "../utils/format-message";

const levelRank: Record<LogLevel, number> = {
	debug: 10,
	log: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60,
};

const shouldLog = (minLevel: LogLevel, level: LogLevel) => (levelRank[level] ?? 0) >= (levelRank[minLevel] ?? 0);

export const makeConsole = (config: ConsoleConfig = {}, baseContext?: string): ConsoleService => {
	const minLevel = config.minLevel ?? "log";

	const withContext = (context: string) => {
		const next = baseContext ? `${baseContext}.${context}` : context;
		return makeConsole(config, next);
	};

	const logEffect = (level: LogLevel, message: LogMessage) =>
		Effect.sync(() => {
			if (!shouldLog(minLevel, level)) return;
			if (level === "error" || level === "fatal") console.error(...formatMessage(level, message, baseContext));
			else if (level === "warn") console.warn(...formatMessage(level, message, baseContext));
			else if (level === "info") console.info(...formatMessage(level, message, baseContext));
			else if (level === "debug") console.debug(...formatMessage(level, message, baseContext));
			else console.log(...formatMessage(level, message, baseContext));
		});

	return {
		log: (message: LogMessage) => logEffect("log", message),
		info: (message: LogMessage) => logEffect("info", message),
		warn: (message: LogMessage) => logEffect("warn", message),
		error: (message: LogMessage) => logEffect("error", message),
		debug: (message: LogMessage) => logEffect("debug", message),
		fatal: (message: LogMessage) => logEffect("fatal", message),
		withContext,
	};
};

export const makeConsoleLayer = (ConsoleTag: ReturnType<(typeof import("@wpackages/functional"))['Effect']['tag']>, config: ConsoleConfig = {}) =>
	Layer.succeed(ConsoleTag, makeConsole(config));
