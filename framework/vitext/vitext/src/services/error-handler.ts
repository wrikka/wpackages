import { logError } from "../utils/logger";

/**
 * Vitext Error Handler Service
 *
 * Provides functional error handling using Result and Option types for better error management.
 */

// Custom error types for vitext
export type VitextError =
	| { readonly _tag: "ConfigError"; readonly message: string; readonly cause?: unknown }
	| { readonly _tag: "BuildError"; readonly message: string; readonly cause?: unknown }
	| { readonly _tag: "ServerError"; readonly message: string; readonly cause?: unknown }
	| { readonly _tag: "FileError"; readonly message: string; readonly cause?: unknown }
	| { readonly _tag: "PluginError"; readonly message: string; readonly cause?: unknown };

// Pure Result type (not using FluentResult from functional)
export type Result<E, A> =
	| { readonly _tag: "Success"; readonly value: A }
	| { readonly _tag: "Failure"; readonly error: E };

// Type aliases for common use cases
export type ConfigResult<T> = Result<VitextError, T>;
export type BuildResult<T> = Result<VitextError, T>;
export type ServerResult<T> = Result<VitextError, T>;
export type FileResult<T> = Result<VitextError, T>;

// Pure Result constructors
export const ok = <E, A>(value: A): Result<E, A> => ({ _tag: "Success", value });
export const err = <E, A>(error: E): Result<E, A> => ({ _tag: "Failure", error });

/**
 * Create a configuration error
 */
export const configError = (message: string, cause?: unknown): VitextError => ({
	_tag: "ConfigError",
	message,
	cause,
});

/**
 * Create a build error
 */
export const buildError = (message: string, cause?: unknown): VitextError => ({
	_tag: "BuildError",
	message,
	cause,
});

/**
 * Create a server error
 */
export const serverError = (message: string, cause?: unknown): VitextError => ({
	_tag: "ServerError",
	message,
	cause,
});

/**
 * Create a file error
 */
export const fileError = (message: string, cause?: unknown): VitextError => ({
	_tag: "FileError",
	message,
	cause,
});

/**
 * Create a plugin error
 */
export const pluginError = (message: string, cause?: unknown): VitextError => ({
	_tag: "PluginError",
	message,
	cause,
});

/**
 * Handle async operations with Result types
 */
export const handleAsync = async <T>(
	operation: () => Promise<T>,
	errorFactory: (error: unknown) => VitextError,
): Promise<Result<VitextError, T>> => {
	try {
		const result = await operation();
		return ok(result);
	} catch (error) {
		return err(errorFactory(error));
	}
};

// Type guards
export const isSuccess = <E, A>(result: Result<E, A>): result is { readonly _tag: "Success"; readonly value: A } =>
	result._tag === "Success";

const isFailure = <E, A>(result: Result<E, A>): result is { readonly _tag: "Failure"; readonly error: E } =>
	result._tag === "Failure";

/**
 * Unwrap a Result, logging errors and returning a default value
 */
export const unwrapOrLog = <T>(result: Result<VitextError, T>, defaultValue: T): T => {
	if (isSuccess(result)) {
		return result.value;
	}

	if (isFailure(result)) {
		const error = result.error;
		logError(`Vitext Error [${error._tag}]: ${error.message}`);
		if (error.cause) {
			logError(`Caused by: ${error.cause}`);
		}
	}

	return defaultValue;
};


/**
 * Convert a Result to a Promise that throws on error
 */
export const resultToPromise = async <T>(result: Result<VitextError, T>): Promise<T> => {
	if (isSuccess(result)) {
		return result.value;
	}

	if (isFailure(result)) {
		const error = result.error;
		throw new Error(`[${error._tag}] ${error.message}`, { cause: error.cause });
	}

	throw new Error("Unknown result state");
};

/**
 * Error handler service class
 */
export class VitextErrorHandler {
	/**
	 * Handle configuration errors
	 */
	handleConfigError<T>(result: ConfigResult<T>, defaultValue: T): T {
		return unwrapOrLog(result, defaultValue);
	}

	/**
	 * Handle build errors
	 */
	handleBuildError<T>(result: BuildResult<T>, defaultValue: T): T {
		return unwrapOrLog(result, defaultValue);
	}

	/**
	 * Handle server errors
	 */
	handleServerError<T>(result: ServerResult<T>, defaultValue: T): T {
		return unwrapOrLog(result, defaultValue);
	}

	/**
	 * Handle file errors
	 */
	handleFileError<T>(result: FileResult<T>, defaultValue: T): T {
		return unwrapOrLog(result, defaultValue);
	}

	/**
	 * Convert Result to Promise
	 */
	async toPromise<T>(result: Result<VitextError, T>): Promise<T> {
		return resultToPromise(result);
	}
}

// Global error handler instance
export const errorHandler = new VitextErrorHandler();
