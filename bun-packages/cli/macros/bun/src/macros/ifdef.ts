/**
 * Conditional compilation macro for build-time feature flags.
 * Includes code only if the condition is true at build time.
 *
 * @param condition - Environment variable name or boolean expression
 * @param fn - Function containing code to conditionally include
 * @returns Code string or empty string based on condition
 *
 * @example
 * // ifdef("DEBUG", () => {
 * //   log.debug("Debug mode enabled")
 * // })
 */
export const ifdef = Bun.macro((condition: string, fn: () => string) => {
	const value = process.env[condition];

	if (value === "true" || value === "1") {
		return fn();
	}

	return "";
});

/**
 * Conditional compilation macro for negated conditions.
 * Includes code only if the condition is false at build time.
 *
 * @param condition - Environment variable name or boolean expression
 * @param fn - Function containing code to conditionally include
 * @returns Code string or empty string based on condition
 *
 * @example
 * // ifndef("PRODUCTION", () => {
 * //   log.warn("Running in development mode")
 * // })
 */
export const ifndef = Bun.macro((condition: string, fn: () => string) => {
	const value = process.env[condition];

	if (value !== "true" && value !== "1") {
		return fn();
	}

	return "";
});

/**
 * Conditional compilation macro for multiple conditions.
 * Includes code only if all conditions are true at build time.
 *
 * @param conditions - Array of environment variable names
 * @param fn - Function containing code to conditionally include
 * @returns Code string or empty string based on conditions
 *
 * @example
 * // ifAll(["DEBUG", "VERBOSE"], () => {
 * //   log.debug("Verbose debug mode enabled")
 * // })
 */
export const ifAll = Bun.macro((conditions: string[], fn: () => string) => {
	const allTrue = conditions.every((cond) => {
		const value = process.env[cond];
		return value === "true" || value === "1";
	});

	if (allTrue) {
		return fn();
	}

	return "";
});

/**
 * Conditional compilation macro for any condition.
 * Includes code if any condition is true at build time.
 *
 * @param conditions - Array of environment variable names
 * @param fn - Function containing code to conditionally include
 * @returns Code string or empty string based on conditions
 *
 * @example
 * // ifAny(["DEBUG", "DEVELOPMENT"], () => {
 * //   log.debug("Debug features enabled")
 * // })
 */
export const ifAny = Bun.macro((conditions: string[], fn: () => string) => {
	const anyTrue = conditions.some((cond) => {
		const value = process.env[cond];
		return value === "true" || value === "1";
	});

	if (anyTrue) {
		return fn();
	}

	return "";
});
