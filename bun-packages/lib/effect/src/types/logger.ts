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
