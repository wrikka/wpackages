/**
 * State validation for @wpackages/store
 * Validation middleware and utilities
 */

export interface ValidationError {
	path: string;
	message: string;
	value: unknown;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
}

export type Validator<T> = (value: T) => ValidationResult;

export type Schema<T> = {
	[K in keyof T]?: Validator<T[K]> | Schema<T[K]>;
};

/**
 * Creates a validator function
 * @param validators Array of validators
 * @returns A validator function
 */
export function createValidator<T>(...validators: Validator<T>[]): Validator<T> {
	return (value: T) => {
		for (const validator of validators) {
			const result = validator(value);
			if (!result.valid) {
				return result;
			}
		}
		return { valid: true, errors: [] };
	};
}

/**
 * Creates a required validator
 * @returns A validator that checks if value is not null/undefined
 */
export function required<T>(value: T): ValidationResult {
	if (value === null || value === undefined) {
		return {
			valid: false,
			errors: [{ path: "", message: "Value is required", value }],
		};
	}
	return { valid: true, errors: [] };
}

/**
 * Creates a type validator
 * @param expectedType The expected type
 * @returns A validator that checks type
 */
export function typeValidator<T>(expectedType: string): Validator<T> {
	return (value: T) => {
		const actualType = typeof value;
		if (actualType !== expectedType) {
			return {
				valid: false,
				errors: [
					{
						path: "",
						message: `Expected type '${expectedType}', got '${actualType}'`,
						value,
					},
				],
			};
		}
		return { valid: true, errors: [] };
	};
}

/**
 * Creates a range validator for numbers
 * @param min Minimum value
 * @param max Maximum value
 * @returns A validator that checks range
 */
export function rangeValidator(min: number, max: number): Validator<number> {
	return (value: number) => {
		if (value < min || value > max) {
			return {
				valid: false,
				errors: [
					{
						path: "",
						message: `Value must be between ${min} and ${max}`,
						value,
					},
				],
			};
		}
		return { valid: true, errors: [] };
	};
}

/**
 * Creates a length validator for strings/arrays
 * @param min Minimum length
 * @param max Maximum length
 * @returns A validator that checks length
 */
export function lengthValidator(min: number, max: number): Validator<string | unknown[]> {
	return (value: string | unknown[]) => {
		const length = value.length;
		if (length < min || length > max) {
			return {
				valid: false,
				errors: [
					{
						path: "",
						message: `Length must be between ${min} and ${max}`,
						value,
					},
				],
			};
		}
		return { valid: true, errors: [] };
	};
}

/**
 * Creates a pattern validator for strings
 * @param pattern Regular expression pattern
 * @returns A validator that checks pattern
 */
export function patternValidator(pattern: RegExp): Validator<string> {
	return (value: string) => {
		if (!pattern.test(value)) {
			return {
				valid: false,
				errors: [
					{
						path: "",
						message: `Value does not match pattern`,
						value,
					},
				],
			};
		}
		return { valid: true, errors: [] };
	};
}

/**
 * Creates a custom validator
 * @param fn Custom validation function
 * @param message Error message
 * @returns A validator
 */
export function customValidator<T>(fn: (value: T) => boolean, message: string): Validator<T> {
	return (value: T) => {
		if (!fn(value)) {
			return {
				valid: false,
				errors: [{ path: "", message, value }],
			};
		}
		return { valid: true, errors: [] };
	};
}

/**
 * Validates a value against a schema
 * @param schema The schema to validate against
 * @param value The value to validate
 * @param path Current path (for nested validation)
 * @returns Validation result
 */
export function validateSchema<T extends object>(
	schema: Schema<T>,
	value: T,
	path = "",
): ValidationResult {
	const errors: ValidationError[] = [];

	for (const key in schema) {
		const validator = schema[key];
		const currentValue = value[key];
		const currentPath = path ? `${path}.${key}` : key;

		if (typeof validator === "function") {
			const result = validator(currentValue);
			if (!result.valid) {
				errors.push(
					...result.errors.map((error: ValidationError) => ({
						...error,
						path: error.path ? `${currentPath}.${error.path}` : currentPath,
					})),
				);
			}
		} else if (typeof currentValue === "object" && currentValue !== null) {
			const result = validateSchema(validator as Schema<unknown>, currentValue as object, currentPath);
			errors.push(...result.errors);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Creates a validation middleware
 * @param validator The validator function
 * @returns Middleware function
 */
export function validationMiddleware<T>(validator: Validator<T>) {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value: T) => {
				const result = validator(value);
				if (!result.valid) {
					console.error("Validation failed:", result.errors);
					throw new Error(`Validation failed: ${result.errors.map((e) => e.message).join(", ")}`);
				}
				originalSet(value);
			},
		};
	};
}

/**
 * Creates a schema middleware
 * @param schema The schema to validate against
 * @returns Middleware function
 */
export function schemaMiddleware<T extends object>(schema: Schema<T>) {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value: T) => {
				const result = validateSchema(schema, value);
				if (!result.valid) {
					console.error("Schema validation failed:", result.errors);
					throw new Error(`Schema validation failed: ${result.errors.map((e) => e.message).join(", ")}`);
				}
				originalSet(value);
			},
		};
	};
}

/**
 * Creates a type guard middleware
 * @param typeGuard The type guard function
 * @param typeName The type name for error messages
 * @returns Middleware function
 */
export function typeGuardMiddleware<T>(typeGuard: (value: unknown) => value is T, typeName: string) {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value: T) => {
				if (!typeGuard(value)) {
					throw new Error(`Invalid type: expected ${typeName}`);
				}
				originalSet(value);
			},
		};
	};
}
