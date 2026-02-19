export interface ErrorContext {
	type: string;
	message: string;
	stack?: string;
	name?: string;
	code?: string;
	timestamp: number;
	correlationId?: string;
	additional?: Record<string, unknown>;
}

export interface ErrorTrackerConfig {
	/** Whether to capture uncaught errors */
	captureUncaught?: boolean;
	/** Whether to capture unhandled rejections */
	captureUnhandledRejections?: boolean;
	/** Callback to handle captured errors */
	onError?: (error: ErrorContext) => void;
}

export class ErrorTracker {
	private config: Required<ErrorTrackerConfig>;
	private originalHandlers: {
		uncaughtException?: ((error: Error) => void) | null;
		unhandledRejection?: ((reason: unknown, promise: Promise<unknown>) => void) | null;
	} = {};

	constructor(config: ErrorTrackerConfig = {}) {
		this.config = {
			captureUncaught: true,
			captureUnhandledRejections: true,
			onError: () => {},
			...config,
		} as Required<ErrorTrackerConfig>;
	}

	start(): void {
		const globalProcess = typeof process !== "undefined" ? process : null;
		if (!globalProcess) return;

		if (this.config.captureUncaught) {
			const listeners = globalProcess.listeners("uncaughtException");
			if (listeners.length > 0) {
				this.originalHandlers.uncaughtException = listeners[0] as (error: Error) => void;
			}
			globalProcess.removeAllListeners("uncaughtException");
			globalProcess.on("uncaughtException", (error: Error) => this.handleUncaughtError(error));
		}

		if (this.config.captureUnhandledRejections) {
			const listeners = globalProcess.listeners("unhandledRejection");
			if (listeners.length > 0) {
				this.originalHandlers.unhandledRejection = listeners[0] as (reason: unknown, promise: Promise<unknown>) => void;
			}
			globalProcess.removeAllListeners("unhandledRejection");
			globalProcess.on(
				"unhandledRejection",
				(reason: unknown, promise: Promise<unknown>) => this.handleUnhandledRejection(reason, promise),
			);
		}
	}

	stop(): void {
		const globalProcess = typeof process !== "undefined" ? process : null;
		if (!globalProcess) return;

		if (this.originalHandlers.uncaughtException) {
			globalProcess.removeListener("uncaughtException", (error: Error) => this.handleUncaughtError(error));
			globalProcess.on("uncaughtException", this.originalHandlers.uncaughtException);
		}
		if (this.originalHandlers.unhandledRejection) {
			globalProcess.removeListener(
				"unhandledRejection",
				(reason: unknown, promise: Promise<unknown>) => this.handleUnhandledRejection(reason, promise),
			);
			globalProcess.on("unhandledRejection", this.originalHandlers.unhandledRejection);
		}
	}

	private handleUncaughtError(error: unknown): void {
		const context = this.createErrorContext(error);
		this.config.onError(context);
	}

	private handleUnhandledRejection(reason: unknown, _promise: Promise<unknown>): void {
		const context = this.createErrorContext(reason);
		this.config.onError(context);
	}

	createErrorContext(error: unknown, additional?: Record<string, unknown>): ErrorContext {
		if (error instanceof Error) {
			const context: ErrorContext = {
				type: "Error",
				message: error.message,
				name: error.name,
				timestamp: Date.now(),
			};

			if (error.stack) {
				context.stack = error.stack;
			}

			const nodeError = error as { code?: string };
			if (nodeError.code) {
				context.code = nodeError.code;
			}

			if (additional) {
				context.additional = additional;
			}

			return context;
		}

		if (typeof error === "string") {
			const context: ErrorContext = {
				type: "String",
				message: error,
				timestamp: Date.now(),
			};

			if (additional) {
				context.additional = additional;
			}

			return context;
		}

		const context: ErrorContext = {
			type: "Unknown",
			message: String(error),
			timestamp: Date.now(),
		};

		if (additional) {
			context.additional = additional;
		}

		return context;
	}

	captureError(error: unknown, additional?: Record<string, unknown>): void {
		const context = this.createErrorContext(error, additional);
		this.config.onError(context);
	}
}

export function createErrorTracker(config?: ErrorTrackerConfig): ErrorTracker {
	return new ErrorTracker(config);
}
