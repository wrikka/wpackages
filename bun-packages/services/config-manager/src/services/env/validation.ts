import { err, ok } from "@wpackages/functional";
import type { EnvSchema, ParsedEnv, Result, ValidationResult } from "../../types/env";
import { validateEnv } from "../../utils";

export const validate = <T = Record<string, unknown>>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
	validationCache: ValidationResult | null,
	useCache: boolean,
): { validation: ValidationResult; result: Result<ValidationResult, Error> } => {
	if (!schema) {
		const error = new Error("No schema provided for validation");
		return {
			validation: { valid: false, errors: [{ key: "_schema", message: error.message }] },
			result: err(error) as Result<ValidationResult, Error>,
		};
	}

	if (validationCache && useCache) {
		return { validation: validationCache, result: ok(validationCache) as Result<ValidationResult, Error> };
	}

	const validation = validateEnv(envData, schema);
	return { validation, result: ok(validation) as Result<ValidationResult, Error> };
};

export const isValid = <T = Record<string, unknown>>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
): boolean => {
	if (!schema) return true;
	const { validation } = validate(envData, schema, null, false);
	return validation.valid;
};
