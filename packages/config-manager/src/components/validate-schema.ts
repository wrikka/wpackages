import type { EnvSchema, ValidationResult } from "../types/env";
import { validateEnv } from "../utils/validate.utils";

/**
 * Validate configuration against schema
 * Pure function - no side effects
 */
export const validateConfigSchema = <T extends Record<string, unknown>>(
	config: T,
	schema: EnvSchema<T>,
): ValidationResult => {
	return validateEnv(config as Record<string, string>, schema);
};

/**
 * Check if configuration is valid
 * Pure function - no side effects
 */
export const isConfigValid = <T extends Record<string, unknown>>(
	config: T,
	schema: EnvSchema<T>,
): boolean => {
	const result = validateConfigSchema(config, schema);
	return result.valid;
};

/**
 * Get validation errors
 * Pure function - no side effects
 */
export const getValidationErrors = <T extends Record<string, unknown>>(
	config: T,
	schema: EnvSchema<T>,
): string[] => {
	const result = validateConfigSchema(config, schema);
	return result.errors.map((e) => e.message);
};

/**
 * Format validation result as string
 * Pure function - no side effects
 */
export const formatValidationResult = (result: ValidationResult): string => {
	if (result.valid) {
		return "Configuration is valid";
	}

	const errors = result.errors.map((e) => `  - ${e.message}`).join("\n");
	return `Configuration validation failed:\n${errors}`;
};
