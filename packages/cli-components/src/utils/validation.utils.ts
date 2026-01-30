/**
 * Validation Utilities (Pure Functions)
 * Unified validation helpers with Result type support
 */

// ===== Result Type =====

export type ValidationError = string;
export type ValidationResult<T> = { readonly _tag: "Ok"; readonly value: T } | {
	readonly _tag: "Err";
	readonly error: string;
};

/**
 * Create a successful validation result
 */
export const valid = <T>(value: T): ValidationResult<T> => ({ _tag: "Ok", value });

/**
 * Create a failed validation result
 */
export const invalid = <T>(_value: T, error: string): ValidationResult<T> => ({ _tag: "Err", error });

// ===== Simple Type Checks =====

/**
 * Validate email format
 */
export const isEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Validate URL format
 */
export const isUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

/**
 * Check if value is a valid number
 */
export const isNumber = (value: unknown): value is number => typeof value === "number" && !Number.isNaN(value);

// ===== Functional Validators (with Result type) =====

/**
 * Validate that a value is not empty
 */
export const validateNotEmpty = <T extends string | unknown[]>(value: T): ValidationResult<T> => {
	if (Array.isArray(value) ? value.length === 0 : (value as string).trim() === "") {
		return { _tag: "Err", error: "Value cannot be empty" };
	}
	return valid(value);
};

/**
 * Validate that a string matches a pattern
 */
export const validatePattern =
	(pattern: RegExp, errorMessage: string) => <T extends string>(value: T): ValidationResult<T> => {
		if (!pattern.test(value)) {
			return { _tag: "Err", error: errorMessage };
		}
		return valid(value);
	};

/**
 * Validate that a number is within a range
 */
export const validateRange =
	(min: number, max: number, errorMessage?: string) => <T extends number>(value: T): ValidationResult<T> => {
		if (value < min || value > max) {
			return { _tag: "Err", error: errorMessage || `Value must be between ${min} and ${max}` };
		}
		return valid(value);
	};

/**
 * Validate that a value satisfies a custom predicate
 */
export const validateWith =
	<T>(predicate: (value: T) => boolean, errorMessage: string) => (value: T): ValidationResult<T> => {
		if (!predicate(value)) {
			return { _tag: "Err", error: errorMessage };
		}
		return valid(value);
	};

/**
 * Combine multiple validators using AND logic
 */
export const validateAll =
	<T>(...validators: Array<(value: T) => ValidationResult<T>>) => (value: T): ValidationResult<T> => {
		for (const validator of validators) {
			const result = validator(value);
			if (result._tag === "Err") {
				return result as ValidationResult<T>;
			}
		}
		return valid(value);
	};

/**
 * Combine multiple validators using OR logic
 */
export const validateAny =
	<T>(...validators: Array<(value: T) => ValidationResult<T>>) => (value: T): ValidationResult<T> => {
		const errors: string[] = [];

		for (const validator of validators) {
			const result = validator(value);
			if (result._tag === "Ok") {
				return result as ValidationResult<T>;
			}
			errors.push(result.error);
		}

		return { _tag: "Err", error: `All validations failed: ${errors.join(", ")}` };
	};

/**
 * Transform a value if validation passes
 */
export const transformIfValid = <T, U>(
	validator: (value: T) => ValidationResult<T>,
	transformer: (value: T) => U,
) =>
(value: T): ValidationResult<U> => {
	const validationResult = validator(value);
	if (validationResult._tag === "Ok") {
		return valid(transformer(validationResult.value));
	}
	return { _tag: "Err", error: validationResult.error };
};

/**
 * Validate email format (with Result)
 */
export const validateEmail = <T extends string>(value: T): ValidationResult<T> => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(value)) {
		return { _tag: "Err", error: "Invalid email format" };
	}
	return valid(value);
};

/**
 * Validate URL format (with Result)
 */
export const validateUrl = <T extends string>(value: T): ValidationResult<T> => {
	try {
		new URL(value);
		return valid(value);
	} catch {
		return { _tag: "Err", error: "Invalid URL format" };
	}
};

/**
 * Validate that a string has minimum length
 */
export const validateMinLength =
	(minLength: number, errorMessage?: string) => <T extends string>(value: T): ValidationResult<T> => {
		if (value.length < minLength) {
			return { _tag: "Err", error: errorMessage || `Value must be at least ${minLength} characters` };
		}
		return valid(value);
	};

/**
 * Validate that a string has maximum length
 */
export const validateMaxLength =
	(maxLength: number, errorMessage?: string) => <T extends string>(value: T): ValidationResult<T> => {
		if (value.length > maxLength) {
			return { _tag: "Err", error: errorMessage || `Value must be at most ${maxLength} characters` };
		}
		return valid(value);
	};

/**
 * Validate that a value is in a whitelist
 */
export const validateIn = <T>(whitelist: readonly T[], errorMessage?: string) => (value: T): ValidationResult<T> => {
	if (!whitelist.includes(value)) {
		return { _tag: "Err", error: errorMessage || `Value must be one of: ${whitelist.join(", ")}` };
	}
	return valid(value);
};

/**
 * Validate that a value is not in a blacklist
 */
export const validateNotIn = <T>(blacklist: readonly T[], errorMessage?: string) => (value: T): ValidationResult<T> => {
	if (blacklist.includes(value)) {
		return { _tag: "Err", error: errorMessage || `Value is not allowed: ${value}` };
	}
	return valid(value);
};
