import { Effect } from "effect";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMeta = Readonly<Record<string, unknown>>;

export type LogEntry = Readonly<{
	level: LogLevel;
	message: string;
	timestamp: number;
	meta?: LogMeta;
}>;

export type LogSink = (entry: LogEntry) => Effect.Effect<void>;

export type LogFormatter<TOutput = unknown> = (entry: LogEntry) => TOutput;

export type LoggerConfig = Readonly<{
	minLevel?: LogLevel;
	baseMeta?: LogMeta;
	redactKeys?: ReadonlyArray<string>;
	formatter?: LogFormatter;
	sinks?: ReadonlyArray<LogSink>;
}>;

export interface Console {
	readonly log: (line: string) => Effect.Effect<void>;
	readonly warn: (line: string) => Effect.Effect<void>;
	readonly error: (line: string) => Effect.Effect<void>;
}

export interface Logger {
	readonly log: (entry: LogEntry) => Effect.Effect<void>;
	readonly debug: (message: string, meta?: LogMeta) => Effect.Effect<void>;
	readonly info: (message: string, meta?: LogMeta) => Effect.Effect<void>;
	readonly warn: (message: string, meta?: LogMeta) => Effect.Effect<void>;
	readonly error: (message: string, meta?: LogMeta) => Effect.Effect<void>;
	readonly child: (meta: LogMeta) => Logger;
}

export interface LogSpan {
	readonly id: string;
	readonly parentId?: string;
	readonly name: string;
	readonly startTime: number;
	readonly endTime?: number;
	readonly meta?: LogMeta;
}

export interface LogContext {
	readonly traceId?: string;
	readonly spanId?: string;
	readonly baggage?: LogMeta;
}
