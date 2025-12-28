import { Effect as FunctionalEffect } from "@wts/functional";
import { Effect, Layer } from "@wts/functional";
import type { Effect as EffectType } from "@wts/functional";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
	readonly level: LogLevel;
	readonly message: string;
	readonly time: number;
	readonly meta?: Readonly<Record<string, unknown>>;
};

export type LoggerConfig = {
	readonly minLevel?: LogLevel;
	readonly redactKeys?: ReadonlyArray<string>;
};

export interface Logger {
	readonly log: (entry: LogEntry) => EffectType<void, never, never>;
}

export const Logger = FunctionalEffect.tag<Logger>();

const levelRank: Record<LogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

const redact = (
	meta: Readonly<Record<string, unknown>> | undefined,
	keys: ReadonlyArray<string>,
): Readonly<Record<string, unknown>> | undefined => {
	if (!meta) return undefined;
	if (keys.length === 0) return meta;
	const out: Record<string, unknown> = { ...meta };
	for (const k of keys) {
		if (k in out) out[k] = "[REDACTED]";
	}
	return out;
};

export const makeLogger = (config: LoggerConfig = {}): Logger => {
	const minLevel = config.minLevel ?? "info";
	const redactKeys = config.redactKeys ?? [];

	return {
		log: (entry) =>
			Effect.tap(Effect.succeed(undefined), () => {
				if (levelRank[entry.level] < levelRank[minLevel]) return;
				const safe = redact(entry.meta, redactKeys);
				const payload = safe ? { ...entry, meta: safe } : entry;
				const line = JSON.stringify(payload);
				if (entry.level === "error") console.error(line);
				else if (entry.level === "warn") console.warn(line);
				else console.log(line);
			}),
	};
};

export const LoggerLive = Layer.succeed(Logger, makeLogger({ redactKeys: ["token", "password", "secret"] }));

export const log = (level: LogLevel, message: string, meta?: Readonly<Record<string, unknown>>) =>
	Effect.gen(function*() {
		const svc = yield Effect.get(Logger);
		yield svc.log({ level, message, time: Date.now(), ...(meta ? { meta } : {}) });
	});

export const debug = (message: string, meta?: Readonly<Record<string, unknown>>) => log("debug", message, meta);
export const info = (message: string, meta?: Readonly<Record<string, unknown>>) => log("info", message, meta);
export const warn = (message: string, meta?: Readonly<Record<string, unknown>>) => log("warn", message, meta);
export const error = (message: string, meta?: Readonly<Record<string, unknown>>) => log("error", message, meta);
