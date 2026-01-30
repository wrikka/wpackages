import { BOOLEAN_VALUES, VARIABLE_PATTERNS } from "../constant/defaults.const";
import type { EnvSchema, ValidationError, ValidationResult, VariableType } from "../types/env";

/**
 * Validate environment against schema
 */
export const validateEnv = <T>(
	env: Record<string, string>,
	schema: EnvSchema<T>,
): ValidationResult => {
	const errors: ValidationError[] = [];
	const warnings: string[] = [];

	for (const [key, definition] of Object.entries(schema)) {
		const def = definition as EnvSchema<T>[keyof T];
		const value: string | undefined = env[key];

		// Check required
		if (def.required && (value === undefined || value === "")) {
			errors.push({
				key,
				message: `Required environment variable '${key}' is not set`,
				type: "missing",
			});
			continue;
		}

		// Skip validation if not set and not required
		if (value === undefined || value === "") continue;

		// Validate type
		if (!validateType(value, def.type)) {
			errors.push({
				key,
				message: `Invalid type for '${key}': expected ${def.type}, got string`,
				type: "type",
			});
		}

		// Validate pattern
		if (def.pattern && !def.pattern.test(value)) {
			errors.push({
				key,
				message: `Value for '${key}' does not match required pattern`,
				type: "pattern",
			});
		}

		// Validate choices
		if (def.choices && !def.choices.includes(value as unknown as typeof def.choices[number])) {
			errors.push({
				key,
				message: `Value for '${key}' must be one of: ${def.choices.join(", ")}`,
				type: "choices",
			});
		}

		// Custom validation
		if (def.validate) {
			const result = def.validate(value);
			if (result === false) {
				errors.push({
					key,
					message: `Validation failed for '${key}'`,
					type: "invalid",
				});
			} else if (typeof result === "string") {
				errors.push({
					key,
					message: result,
					type: "invalid",
				});
			}
		}
	}

	return {
		errors,
		valid: errors.length === 0,
		warnings,
	};
};

/**
 * Validate value type
 */
const validateType = (value: string, type: VariableType): boolean => {
	switch (type) {
		case "string":
			return typeof value === "string";

		case "number":
			return VARIABLE_PATTERNS.number.test(value);

		case "boolean":
			return VARIABLE_PATTERNS.boolean.test(value);

		case "url":
			return VARIABLE_PATTERNS.url.test(value);

		case "email":
			return VARIABLE_PATTERNS.email.test(value);

		case "json":
			try {
				JSON.parse(value);
				return true;
			} catch {
				return false;
			}

		case "array":
			return true; // Arrays are comma-separated strings

		default:
			return true;
	}
};

/**
 * Cast value to type
 */
export const castValue = <T>(value: string, type: VariableType): T => {
	switch (type) {
		case "number":
			return Number(value) as T;

		case "boolean":
			return (BOOLEAN_VALUES[value.toLowerCase()] ?? false) as T;

		case "json":
			return JSON.parse(value) as T;

		case "array":
			return value.split(",").map((v) => v.trim()) as T;

		default:
			return value as T;
	}
};
