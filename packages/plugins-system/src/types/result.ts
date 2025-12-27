/**
 * Result Type
 * Unified Result type for all plugin operations
 */

/**
 * Result type for plugin operations
 * Success: { _tag: "Success"; readonly value: T }
 * Failure: { _tag: "Failure"; readonly error: string }
 */
export type PluginResult<T = undefined> =
	| { readonly _tag: "Success"; readonly value: T }
	| { readonly _tag: "Failure"; readonly error: string };

/**
 * Create a success result
 * @param value - Success value
 * @returns Success result
 */
export const success = <T>(value: T): PluginResult<T> => ({
	_tag: "Success",
	value,
});

/**
 * Create a failure result
 * @param error - Error message
 * @returns Failure result
 */
export const failure = (error: string): PluginResult<never> => ({
	_tag: "Failure",
	error,
});

/**
 * Check if result is success
 * @param result - Result to check
 * @returns True if success
 */
export const isSuccess = <T>(result: PluginResult<T>): result is { readonly _tag: "Success"; readonly value: T } =>
	result._tag === "Success";

/**
 * Check if result is failure
 * @param result - Result to check
 * @returns True if failure
 */
export const isFailure = <T>(result: PluginResult<T>): result is { readonly _tag: "Failure"; readonly error: string } =>
	result._tag === "Failure";

/**
 * Map result value
 * @param result - Result to map
 * @param fn - Mapping function
 * @returns Mapped result
 */
export const mapResult = <T, U>(
	result: PluginResult<T>,
	fn: (value: T) => U,
): PluginResult<U> => {
	if (isSuccess(result)) {
		return success(fn(result.value));
	}
	return result as PluginResult<U>;
};

/**
 * Flat map result
 * @param result - Result to flat map
 * @param fn - Flat mapping function
 * @returns Flat mapped result
 */
export const flatMapResult = <T, U>(
	result: PluginResult<T>,
	fn: (value: T) => PluginResult<U>,
): PluginResult<U> => {
	if (isSuccess(result)) {
		return fn(result.value);
	}
	return result as PluginResult<U>;
};

/**
 * Get value from result or throw
 * @param result - Result
 * @returns Value if success, throws if failure
 */
export const getOrThrow = <T>(result: PluginResult<T>): T => {
	if (isSuccess(result)) {
		return result.value;
	}
	throw new Error(result.error);
};

/**
 * Get value from result or default
 * @param result - Result
 * @param defaultValue - Default value
 * @returns Value if success, default if failure
 */
export const getOrDefault = <T>(result: PluginResult<T>, defaultValue: T): T => {
	if (isSuccess(result)) {
		return result.value;
	}
	return defaultValue;
};
