/**
 * Assertion error and helpers
 */

/**
 * Assertion error
 */
export class AssertionError extends Error {
	constructor(
		message: string,
		public expected?: unknown,
		public actual?: unknown,
	) {
		super(message);
		this.name = "AssertionError";
	}
}

/**
 * Helper to throw assertion error if condition fails
 */
export const throwIfFails = (
	pass: boolean,
	message: string,
	expected?: unknown,
	actual?: unknown,
): void => {
	if (!pass) {
		throw new AssertionError(message, expected, actual);
	}
};
