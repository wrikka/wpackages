/**
 * Compile-time assertion that throws at build time if condition is false.
 * Useful for ensuring critical requirements are met at build time.
 *
 * @param condition - The condition to assert
 * @param message - Error message to display if assertion fails
 * @throws Error if condition is false
 *
 * @example
 * assert(process.env.NODE_ENV === "production", "Must be production");
 * assert(typeof API_KEY === "string" && API_KEY.length > 0, "API_KEY must be set");
 */
export const assert = Bun.macro((condition: boolean, message: string) => {
	if (!condition) {
		throw new Error(`Assertion failed: ${message}`);
	}
	return "";
});
