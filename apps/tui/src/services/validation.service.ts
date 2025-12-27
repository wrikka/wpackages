/**
 * Validation Service
 * Handles validation with side effects (error display)
 */

import { renderError } from "../components/text.component";
import * as Output from "./output.service";

/**
 * Validate with visual feedback
 */
export const validateWithFeedback = async <T>(
	value: T,
	validator?: (v: T) => boolean | string | Promise<boolean | string>,
): Promise<boolean> => {
	if (!validator) return true;

	const result = await Promise.resolve(validator(value));

	if (result !== true) {
		const errorMessage = typeof result === "string" ? result : "Invalid input";
		Output.writeLine(renderError(errorMessage));
		return false;
	}

	return true;
};

/**
 * Validate silently (no output)
 */
export const validate = async <T>(
	value: T,
	validator?: (v: T) => boolean | string | Promise<boolean | string>,
): Promise<{ valid: boolean; error?: string }> => {
	if (!validator) return { valid: true };

	const result = await Promise.resolve(validator(value));

	if (result === true) {
		return { valid: true };
	}

	const error = typeof result === "string" ? result : "Invalid input";
	return { valid: false, error };
};
