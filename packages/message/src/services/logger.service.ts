import { Context, Effect, Layer } from "effect";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Readonly<Record<string, unknown>>;

export interface LoggerService {
	readonly log: (level: LogLevel, message: string, meta?: LogMeta) => Effect.Effect<void>;
	readonly debug: (message: string, meta?: LogMeta) => Effect.Effect<void>;
	readonly info: (message: string, meta?: LogMeta) => Effect.Effect<void>;
	readonly warn: (message: string, meta?: LogMeta) => Effect.Effect<void>;
	readonly error: (message: string, meta?: LogMeta) => Effect.Effect<void>;
}

export const LoggerService = Context.GenericTag<LoggerService>("LoggerService");

const stringifyMeta = (meta: LogMeta | undefined): string => {
	if (!meta) {
		return "";
	}
	try {
		return ` ${JSON.stringify(meta)}`;
	} catch {
		return "";
	}
};

const makeConsoleLogger = (): LoggerService => {
	const log = (level: LogLevel, message: string, meta?: LogMeta) =>
		Effect.sync(() => {
			const payload = `${message}${stringifyMeta(meta)}`;
			switch (level) {
				case "debug":
					console.debug(payload);
					return;
				case "info":
					console.info(payload);
					return;
				case "warn":
					console.warn(payload);
					return;
				case "error":
					console.error(payload);
					return;
			}
		});

	return {
		log,
		debug: (message, meta) => log("debug", message, meta),
		info: (message, meta) => log("info", message, meta),
		warn: (message, meta) => log("warn", message, meta),
		error: (message, meta) => log("error", message, meta),
	};
};

export const LoggerServiceLive: Layer.Layer<LoggerService> = Layer.sync(
	LoggerService,
	makeConsoleLogger,
);

export const LoggerServiceSilent: Layer.Layer<LoggerService> = Layer.succeed(
	LoggerService,
	{
		log: () => Effect.void,
		debug: () => Effect.void,
		info: () => Effect.void,
		warn: () => Effect.void,
		error: () => Effect.void,
	},
);
