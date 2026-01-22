/**
 * Validation utilities for common patterns
 */

import { string } from "../schemas/primitives.js";
import type { Schema } from "../types/core.js";

// String validation utilities
export function email(): Schema<string> {
  return string().refine(
    (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Invalid email format"
  );
}

export function url(): Schema<string> {
  return string().refine(
    (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    "Invalid URL format"
  );
}

export function uuid(): Schema<string> {
  return string().refine(
    (value) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
    "Invalid UUID format"
  );
}

export function minLength(min: number): (schema: Schema<string>) => Schema<string> {
  return (schema) =>
    schema.refine((value) => value.length >= min, `Minimum length is ${min}`);
}

export function maxLength(max: number): (schema: Schema<string>) => Schema<string> {
  return (schema) =>
    schema.refine((value) => value.length <= max, `Maximum length is ${max}`);
}

export function pattern(regex: RegExp): (schema: Schema<string>) => Schema<string> {
  return (schema) =>
    schema.refine(
      (value) => regex.test(value),
      `Value does not match pattern ${regex.source}`
    );
}

// Number validation utilities
export function min(minValue: number): (schema: Schema<number>) => Schema<number> {
  return (schema) =>
    schema.refine((value) => value >= minValue, `Minimum value is ${minValue}`);
}

export function max(maxValue: number): (schema: Schema<number>) => Schema<number> {
  return (schema) =>
    schema.refine((value) => value <= maxValue, `Maximum value is ${maxValue}`);
}

export function positive(): (schema: Schema<number>) => Schema<number> {
  return (schema) => schema.refine((value) => value > 0, "Value must be positive");
}

export function negative(): (schema: Schema<number>) => Schema<number> {
  return (schema) => schema.refine((value) => value < 0, "Value must be negative");
}

export function integer(): (schema: Schema<number>) => Schema<number> {
  return (schema) =>
    schema.refine((value) => Number.isInteger(value), "Value must be an integer");
}

// Array validation utilities
export function nonEmpty(): (schema: Schema<unknown[]>) => Schema<unknown[]> {
  return (schema) => schema.refine((value) => value.length > 0, "Array must not be empty");
}

export function minItems(minItems: number): (schema: Schema<unknown[]>) => Schema<unknown[]> {
  return (schema) =>
    schema.refine(
      (value) => value.length >= minItems,
      `Minimum ${minItems} items required`
    );
}

export function maxItems(maxItems: number): (schema: Schema<unknown[]>) => Schema<unknown[]> {
  return (schema) =>
    schema.refine(
      (value) => value.length <= maxItems,
      `Maximum ${maxItems} items allowed`
    );
}

// Date validation utilities
export function minDate(date: Date): (schema: Schema<Date>) => Schema<Date> {
  return (schema) =>
    schema.refine((value) => value >= date, `Date must be after ${date.toISOString()}`);
}

export function maxDate(date: Date): (schema: Schema<Date>) => Schema<Date> {
  return (schema) =>
    schema.refine((value) => value <= date, `Date must be before ${date.toISOString()}`);
}
