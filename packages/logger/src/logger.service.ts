import { Context, Effect, Layer } from "effect";
import { createConfig, DEFAULT_CONFIG } from "./config";
import { jsonFormatter } from "./formatters/json.formatter";
import { redactMeta } from "./formatters/redact.formatter";
import { createMultiSink } from "./sinks/multi.sink";
import type { Console, LogEntry, Logger, LoggerConfig, LogLevel, LogMeta } from "./types";

export const Console = Context.GenericTag<Console>("@wpackages/logger/Console");
export const LoggerConfigTag = Context.GenericTag<LoggerConfig>("@wpackages/logger/LoggerConfig");

const levelRank: Record<LogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

const shouldLog = (minLevel: LogLevel, level: LogLevel): boolean => {
	return levelRank[level] >= levelRank[minLevel];
};

const mergeMeta = (base: LogMeta | undefined, next: LogMeta | undefined): LogMeta | undefined => {
	if (!base && !next) return undefined;
	return { ...base, ...next };
};

export const makeLogger = Effect.gen(function*() {
	const console = yield* Console;
	const config = yield* LoggerConfigTag;

	const mergedConfig = createConfig(config);
	const minLevel = mergedConfig.minLevel ?? "info";
	const redactKeys = mergedConfig.redactKeys ?? [];
	const formatter = mergedConfig.formatter ?? jsonFormatter;
	const sinks = mergedConfig.sinks ?? [];

	const log = (entry: LogEntry): Effect.Effect<void> => {
		if (!shouldLog(minLevel, entry.level)) {
			return Effect.void;
		}

		const safeMeta = redactMeta(entry.meta, redactKeys);
		const payload = safeMeta ? { ...entry, meta: safeMeta } : entry;
		const line = formatter(payload);

		if (sinks.length === 0) {
			switch (entry.level) {
				case "error":
					return console.error(line);
				case "warn":
					return console.warn(line);
				default:
					return console.log(line);
			}
		}

		const sink = createMultiSink(sinks);
		return sink(payload);
	};

	const child = (meta: LogMeta): Logger => {
		const mergedMeta = mergeMeta(mergedConfig.baseMeta, meta);
		return Effect.succeed({
			log,
			debug: (message, m) => log({ level: "debug", message, timestamp: Date.now(), ...(m ? { meta: m } : {}) }),
			info: (message, m) => log({ level: "info", message, timestamp: Date.now(), ...(m ? { meta: m } : {}) }),
			warn: (message, m) => log({ level: "warn", message, timestamp: Date.now(), ...(m ? { meta: m } : {}) }),
			error: (message, m) => log({ level: "error", message, timestamp: Date.now(), ...(m ? { meta: m } : {}) }),
			child: (m) => child(mergeMeta(mergedMeta, m)),
		});
	};

	return {
		log,
		debug: (message, meta) => log({ level: "debug", message, timestamp: Date.now(), ...(meta ? { meta } : {}) }),
		info: (message, meta) => log({ level: "info", message, timestamp: Date.now(), ...(meta ? { meta } : {}) }),
		warn: (message, meta) => log({ level: "warn", message, timestamp: Date.now(), ...(meta ? { meta } : {}) }),
		error: (message, meta) => log({ level: "error", message, timestamp: Date.now(), ...(meta ? { meta } : {}) }),
		child,
	} satisfies Logger;
});

export const Logger = Context.GenericTag<Logger>("@wpackages/logger/Logger");

export const ConsoleLive = Layer.succeed(
	Console,
	Console.of({
		log: (line: string) => Effect.sync(() => console.log(line)),
		warn: (line: string) => Effect.sync(() => console.warn(line)),
		error: (line: string) => Effect.sync(() => console.error(line)),
	}),
);

export const LoggerLive = Layer.effect(Logger, makeLogger);

export const DefaultLoggerLayer = LoggerLive.pipe(
	Layer.provide(ConsoleLive),
	Layer.provide(Layer.succeed(LoggerConfigTag, DEFAULT_CONFIG)),
);
