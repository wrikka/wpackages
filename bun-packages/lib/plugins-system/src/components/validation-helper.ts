/**
 * Validation Helper Component
 * Pure functions for collecting and formatting validation errors
 */

/**
 * Collect validation errors
 * @param errors - Array of error messages
 * @returns Frozen array of errors
 */
export const collectErrors = (errors: string[]): readonly string[] => Object.freeze(errors);

/**
 * Add error if condition is true
 * @param errors - Error array
 * @param condition - Condition to check
 * @param message - Error message
 * @returns Updated error array
 */
export const addErrorIf = (
	errors: string[],
	condition: boolean,
	message: string,
): string[] => {
	if (condition) {
		errors.push(message);
	}
	return errors;
};

/**
 * Validate required string field
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @param errors - Error array
 * @returns Updated error array
 */
export const validateRequiredString = (
	value: unknown,
	fieldName: string,
	errors: string[],
): string[] => {
	if (!value || (typeof value === "string" && value.trim() === "")) {
		errors.push(`${fieldName} is required`);
	}
	return errors;
};

/**
 * Validate string format (regex)
 * @param value - Value to validate
 * @param pattern - Regex pattern
 * @param fieldName - Field name for error message
 * @param errors - Error array
 * @returns Updated error array
 */
export const validateStringFormat = (
	value: unknown,
	pattern: RegExp,
	fieldName: string,
	errors: string[],
): string[] => {
	if (typeof value === "string" && !pattern.test(value)) {
		errors.push(`${fieldName} format is invalid`);
	}
	return errors;
};

/**
 * Validate array of items
 * @param items - Items to validate
 * @param validator - Validator function
 * @param errors - Error array
 * @returns Updated error array
 */
export const validateArray = <T>(
	items: T[] | undefined,
	validator: (item: T, errors: string[]) => string[],
	errors: string[],
): string[] => {
	if (items) {
		for (const item of items) {
			validator(item, errors);
		}
	}
	return errors;
};

/**
 * Check if there are validation errors
 * @param errors - Error array
 * @returns True if there are errors
 */
export const hasErrors = (errors: readonly string[]): boolean => errors.length > 0;

/**
 * Get first error or undefined
 * @param errors - Error array
 * @returns First error or undefined
 */
export const getFirstError = (errors: readonly string[]): string | undefined => errors[0];

/**
 * Join errors into a single message
 * @param errors - Error array
 * @param separator - Separator between errors
 * @returns Joined error message
 */
export const joinErrors = (errors: readonly string[], separator: string = "; "): string =>
	errors.join(separator);
