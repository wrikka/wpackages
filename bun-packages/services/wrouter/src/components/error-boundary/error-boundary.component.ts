export interface ErrorBoundaryOptions {
	readonly fallback?: ErrorFallback;
	readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
	readonly resetKeys?: readonly string[];
}

export interface ErrorInfo {
	readonly componentStack?: string;
	 readonly errorBoundary?: string;
}

export interface ErrorFallback {
	readonly error: Error;
	readonly reset: () => void;
	readonly errorInfo?: ErrorInfo;
}

export interface ErrorBoundaryState {
	readonly hasError: boolean;
	readonly error?: Error;
	readonly errorInfo?: ErrorInfo;
}

export class ErrorBoundary {
	private state: ErrorBoundaryState = { hasError: false };
	private readonly options: Required<ErrorBoundaryOptions>;
	private readonly listeners = new Set<(state: ErrorBoundaryState) => void>();
	private previousResetKeys: readonly string[] = [];

	constructor(options: ErrorBoundaryOptions = {}) {
		this.options = {
			fallback: options.fallback ?? this.defaultFallback,
			onError: options.onError ?? this.defaultErrorHandler,
			resetKeys: options.resetKeys ?? [],
		};
	}

	private defaultFallback: ErrorFallback = {
		error: new Error("Something went wrong"),
		reset: () => this.reset(),
	};

	private defaultErrorHandler(error: Error, errorInfo: ErrorInfo): void {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	catch(error: Error, errorInfo?: ErrorInfo): void {
		this.state = {
			hasError: true,
			error,
			errorInfo: errorInfo ?? {},
		};

		this.options.onError(error, errorInfo ?? {});
		this.notify();
	}

	reset(): void {
		this.state = { hasError: false };
		this.notify();
	}

	resetIfChanged(resetKeys: readonly string[]): void {
		if (this.hasResetKeysChanged(resetKeys)) {
			this.reset();
			this.previousResetKeys = resetKeys;
		}
	}

	private hasResetKeysChanged(resetKeys: readonly string[]): boolean {
		if (resetKeys.length !== this.previousResetKeys.length) {
			return true;
		}

		for (let i = 0; i < resetKeys.length; i++) {
			if (resetKeys[i] !== this.previousResetKeys[i]) {
				return true;
			}
		}

		return false;
	}

	getState(): ErrorBoundaryState {
		return Object.freeze({ ...this.state });
	}

	listen(listener: (state: ErrorBoundaryState) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notify(): void {
		const state = this.getState();
		for (const listener of this.listeners) {
			listener(state);
		}
	}

	getFallback(): ErrorFallback {
		return {
			error: this.state.error ?? new Error("Unknown error"),
			reset: () => this.reset(),
			errorInfo: this.state.errorInfo ?? {},
		};
	}
}

export const createErrorBoundary = (options?: ErrorBoundaryOptions) => {
	return new ErrorBoundary(options);
};

export class RouteErrorBoundary extends ErrorBoundary {
	private readonly routePath: string;

	constructor(routePath: string, options?: ErrorBoundaryOptions) {
		super(options);
		this.routePath = routePath;
	}

	catch(error: Error, errorInfo?: ErrorInfo): void {
		const routeErrorInfo: ErrorInfo = {
			...errorInfo,
			errorBoundary: this.routePath,
		};

		super.catch(error, routeErrorInfo);
	}
}

export const createRouteErrorBoundary = (routePath: string, options?: ErrorBoundaryOptions) => {
	return new RouteErrorBoundary(routePath, options);
};

export const withErrorBoundary = <T extends (...args: readonly unknown[]) => unknown>(
	fn: T,
	errorBoundary: ErrorBoundary,
): T => {
	return ((...args: readonly unknown[]) => {
		try {
			const result = fn(...args);
			if (result instanceof Promise) {
				return result.catch((error) => {
					errorBoundary.catch(error);
					return errorBoundary.getFallback();
				});
			}
			return result;
		} catch (error) {
			errorBoundary.catch(error as Error);
			return errorBoundary.getFallback();
		}
	}) as T;
};
