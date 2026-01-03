import type { Effect as EffectType } from "@wpackages/functional";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "log";

export type LogMessage =
	| string
	| number
	| boolean
	| bigint
	| null
	| undefined
	| Error
	| Readonly<Record<string, unknown>>;

export type ConsoleConfig = {
	readonly minLevel?: LogLevel;
};

export interface Console {
	readonly log: (message: LogMessage) => EffectType<void, never, never>;
	readonly info: (message: LogMessage) => EffectType<void, never, never>;
	readonly warn: (message: LogMessage) => EffectType<void, never, never>;
	readonly error: (message: LogMessage) => EffectType<void, never, never>;
	readonly debug: (message: LogMessage) => EffectType<void, never, never>;
	readonly fatal: (message: LogMessage) => EffectType<void, never, never>;
	readonly withContext: (context: string) => Console;
}
