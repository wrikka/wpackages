import type { z } from "zod";
import type { FormValidationOptions, ValidationOptions, ValidationResult, Validator } from "../../types/validation";

export const validate = async <T,>(
	value: T,
	options: ValidationOptions<T>,
): Promise<string | undefined> => {
	const { schema, validate: validateFn, async: isAsync = false } = options;

	if (schema) {
		const result = schema.safeParse(value);
		if (!result.success) {
			return result.error.issues[0]?.message ?? "Validation failed";
		}
	}

	if (validateFn) {
		if (isAsync) {
			return await validateFn(value);
		}
		return validateFn(value);
	}

	return undefined;
};

export const validateForm = async <T extends Record<string, unknown>>(
	values: T,
	options: FormValidationOptions<T>,
): Promise<ValidationResult> => {
	const { schema, validators, async: isAsync = false, stopOnFirstError = false } = options;
	const errors: ValidationResult["errors"] = [];

	if (schema) {
		const result = schema.safeParse(values);
		if (!result.success) {
			for (const issue of result.error.issues) {
				errors.push({
					field: issue.path.join("."),
					message: issue.message,
					value: values[issue.path[0] as keyof T],
				});
				if (stopOnFirstError) {
					return { valid: false, errors };
				}
			}
		}
	}

	if (validators) {
		for (const [field, validator] of Object.entries(validators)) {
			if (validator) {
				const error = isAsync
					? await validator(values[field as keyof T])
					: validator(values[field as keyof T]);
				const errorMessage = await Promise.resolve(error);
				if (errorMessage) {
					errors.push({
						field,
						message: errorMessage,
						value: values[field as keyof T],
					});
					if (stopOnFirstError) {
						return { valid: false, errors };
					}
				}
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

export const createValidator = <T,>(
	fn: (value: T) => string | undefined | Promise<string | undefined>,
): Validator<T> => fn;

export const withZodSchema = <T extends z.ZodTypeAny>(
	schema: T,
): ValidationOptions<z.infer<T>> => ({
	schema: schema as z.ZodSchema<z.infer<T>>,
});

export const combineValidators = <T,>(
	...validators: Validator<T>[]
): Validator<T> => {
	return async (value: T) => {
		for (const validator of validators) {
			const error = await validator(value);
			if (error) {
				return error;
			}
		}
		return undefined;
	};
};
