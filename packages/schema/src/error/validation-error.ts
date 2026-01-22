/**
 * Validation error types and utilities
 */

import type { ValidationError } from "../types/core.js";

export class SchemaValidationError extends Error {
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super("Schema validation failed");
    this.name = "SchemaValidationError";
    this.errors = errors;
  }

  toString(): string {
    return this.errors.map((err) => {
      const path = err.path.length > 0 ? `Path: ${err.path.join(".")} - ` : "";
      return `${path}${err.message}`;
    }).join("\n");
  }

  toJSON(): ValidationError[] {
    return this.errors;
  }
}

export function formatError(error: ValidationError): string {
  const path = error.path.length > 0 ? `Path: ${error.path.join(".")} - ` : "";
  return `${path}${error.message}`;
}

export function mergeErrors(errors: ValidationError[]): ValidationError {
  return {
    path: [],
    message: "Multiple validation errors",
    code: "multiple_errors",
    issues: errors,
  };
}
