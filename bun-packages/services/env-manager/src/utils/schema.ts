import * as fs from "node:fs";
import * as path from "node:path";
import type { SchemaDefinition, SchemaFormat, SchemaLoadError, ValidationResult, ValidationError } from "../types/schema";

const VARIABLE_PATTERNS = {
	number: /^-?\d+\.?\d*$/,
	boolean: /^(true|false|1|0)$/i,
	url: /^https?:\/\/.+/,
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const loadSchema = (
	schemaPath: string,
): SchemaDefinition | SchemaLoadError => {
	try {
		const absolutePath = path.resolve(process.cwd(), schemaPath);
		const content = fs.readFileSync(absolutePath, "utf8");
		const ext = path.extname(schemaPath).toLowerCase();
		const format: SchemaFormat = ext === ".json" ? "json" : "typescript";

		if (format === "json") {
			return JSON.parse(content) as SchemaDefinition;
		}

		throw new Error(`Unsupported schema format: ${format}`);
	} catch (error) {
		return {
			_tag: "SchemaLoadError",
			message: `Failed to load schema from ${schemaPath}: ${error instanceof Error ? error.message : String(error)}`,
			cause: error,
		};
	}
};

export const validateEnv = (
	env: Record<string, unknown>,
	schema: SchemaDefinition,
): ValidationResult => {
	const errors: ValidationError[] = [];

	for (const [key, definition] of Object.entries(schema)) {
		const value = env[key];
		const envKey = definition.env || key;

		if (definition.required && (value === undefined || value === "")) {
			errors.push({
				key: envKey,
				message: `Required environment variable '${envKey}' is not set`,
				type: "missing",
			});
			continue;
		}

		if (value === undefined || value === "") continue;

		const stringValue = String(value);

		if (definition.type && !validateType(stringValue, definition.type)) {
			errors.push({
				key: envKey,
				message: `Invalid type for '${envKey}': expected ${definition.type}, got string`,
				type: "type",
			});
		}

		if (definition.pattern && !definition.pattern.test(stringValue)) {
			errors.push({
				key: envKey,
				message: `Value for '${envKey}' does not match required pattern`,
				type: "pattern",
			});
		}

		if (definition.choices && !definition.choices.includes(stringValue)) {
			errors.push({
				key: envKey,
				message: `Value for '${envKey}' must be one of: ${definition.choices.join(", ")}`,
				type: "choices",
			});
		}

		if (definition.validate) {
			const result = definition.validate(stringValue);
			if (result === false) {
				errors.push({
					key: envKey,
					message: `Validation failed for '${envKey}'`,
					type: "invalid",
				});
			} else if (typeof result === "string") {
				errors.push({
					key: envKey,
					message: result,
					type: "invalid",
				});
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

const validateType = (value: string, type: string): boolean => {
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
			return true;
		default:
			return true;
	}
};

export const formatValidationErrors = (result: ValidationResult): string => {
	if (result.valid) return "✓ All environment variables are valid";

	const lines = ["✗ Validation errors:"];
	for (const error of result.errors) {
		lines.push(`  - ${error.key}: ${error.message}`);
	}
	return lines.join("\n");
};
