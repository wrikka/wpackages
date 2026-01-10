export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
	readonly level: LogLevel;
	readonly message: string;
	readonly timestamp: number;
	readonly context?: Record<string, unknown>;
	readonly correlationId?: string;
}

export interface Logger {
	debug(message: string, context?: Record<string, unknown>): void;
	info(message: string, context?: Record<string, unknown>): void;
	warn(message: string, context?: Record<string, unknown>): void;
	error(message: string, context?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
	constructor(private correlationId?: string) {}

	private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
		const entry: LogEntry = {
			level,
			message,
			timestamp: Date.now(),
			context,
			correlationId: this.correlationId,
		};
		console.log(JSON.stringify(entry));
	}

	debug(message: string, context?: Record<string, unknown>): void {
		this.log("debug", message, context);
	}

	info(message: string, context?: Record<string, unknown>): void {
		this.log("info", message, context);
	}

	warn(message: string, context?: Record<string, unknown>): void {
		this.log("warn", message, context);
	}

	error(message: string, context?: Record<string, unknown>): void {
		this.log("error", message, context);
	}
}

export const createLogger = (correlationId?: string): Logger => {
	return new ConsoleLogger(correlationId);
};
