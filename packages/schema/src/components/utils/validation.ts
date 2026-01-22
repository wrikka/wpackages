/**
 * Validation utilities for common patterns
 */

import * as validators from "@wpackages/validator";
import type { Schema } from "../../types/core";
import { string } from "../schemas/primitives";

// String validation utilities
export function email(): Schema<string> {
	return string().refine(
		(value: string) => validators.email()(value).success,
	).withMessage("Invalid email format");
}

export function url(): Schema<string> {
	return string().refine(
		(value: string) => validators.url()(value).success,
	).withMessage("Invalid URL format");
}

export function uuid(): Schema<string> {
	return string().refine(
		(value: string) => validators.uuid()(value).success,
	).withMessage("Invalid UUID format");
}

export function minLength(min: number): (schema: Schema<string>) => Schema<string> {
  return (schema) =>
    schema.refine((value: string) => validators.minLength(min)(value).success).withMessage(`Minimum length is ${min}`);
}

export function maxLength(max: number): (schema: Schema<string>) => Schema<string> {
  return (schema) =>
    schema.refine((value: string) => validators.maxLength(max)(value).success).withMessage(`Maximum length is ${max}`);
}

export function pattern(regex: RegExp): (schema: Schema<string>) => Schema<string> {
  return (schema) =>
    schema.refine(
      (value: string) => validators.pattern(regex)(value).success
    ).withMessage(`Value does not match pattern ${regex.source}`);
}

export function min(minValue: number): (schema: Schema<number>) => Schema<number> {
	return (schema) =>
		schema.refine((value: number) => validators.min(minValue)(value).success).withMessage(
			`Minimum value is ${minValue}`,
		);
}

export function max(maxValue: number): (schema: Schema<number>) => Schema<number> {
	return (schema) =>
		schema.refine((value: number) => validators.max(maxValue)(value).success).withMessage(
			`Maximum value is ${maxValue}`,
		);
}

export function positive(): (schema: Schema<number>) => Schema<number> {
	return (schema) =>
		schema.refine((value: number) => validators.positive()(value).success).withMessage("Value must be positive");
}

export function negative(): (schema: Schema<number>) => Schema<number> {
	return (schema) =>
		schema.refine((value: number) => validators.negative()(value).success).withMessage("Value must be negative");
}

export function integer(): (schema: Schema<number>) => Schema<number> {
	return (schema) =>
		schema.refine((value: number) => validators.integer()(value).success).withMessage("Value must be an integer");
}

export function nonEmpty(): (schema: Schema<unknown[]>) => Schema<unknown[]> {
	return (schema) =>
		schema.refine((value: unknown[]) => validators.arrayNonEmpty()(value).success).withMessage(
			"Array must not be empty",
		);
}

export function minItems(minItems: number): (schema: Schema<unknown[]>) => Schema<unknown[]> {
	return (schema) =>
		schema.refine(
			(value: unknown[]) => validators.minItems(minItems)(value).success,
		).withMessage(`Minimum ${minItems} items required`);
}

export function maxItems(maxItems: number): (schema: Schema<unknown[]>) => Schema<unknown[]> {
	return (schema) =>
		schema.refine(
			(value: unknown[]) => validators.maxItems(maxItems)(value).success,
		).withMessage(`Maximum ${maxItems} items allowed`);
}

export function minDate(date: Date): (schema: Schema<Date>) => Schema<Date> {
	return (schema) =>
		schema.refine((value: Date) => validators.minDate(date)(value).success).withMessage(
			`Date must be after ${date.toISOString()}`,
		);
}

export function maxDate(date: Date): (schema: Schema<Date>) => Schema<Date> {
	return (schema) =>
		schema.refine((value: Date) => validators.maxDate(date)(value).success).withMessage(
			`Date must be before ${date.toISOString()}`,
		);
}
