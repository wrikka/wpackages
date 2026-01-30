import type { z } from "zod";

export type Validator<T> = (value: T) => string | undefined | Promise<string | undefined>;

export interface ValidationOptions<T> {
	schema?: z.ZodSchema<T>;
	validate?: Validator<T>;
	async?: boolean;
}

export interface ValidationFieldError {
	field: string;
	message: string;
	value: unknown;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationFieldError[];
}

export interface FormValidationOptions<T extends Record<string, unknown>> {
	schema?: z.ZodSchema<T>;
	validators?: Partial<Record<keyof T, Validator<T[keyof T]>>>;
	async?: boolean;
	stopOnFirstError?: boolean;
}
