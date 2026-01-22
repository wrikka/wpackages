/**
 * Core types for schema validation
 */

export type Schema<T = unknown> = {
  parse: (value: unknown) => Result<T>;
  safeParse: (value: unknown) => SafeParseResult<T>;
  optional: () => Schema<T | undefined>;
  nullable: () => Schema<T | null>;
  transform: <U>(fn: (value: T) => U) => Schema<U>;
  refine: (refinement: (value: T) => boolean | string) => Schema<T>;
  withMessage: (message: string) => Schema<T>;
};

export type Result<T> = Success<T> | Failure;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure {
  success: false;
  error: ValidationError;
}

export type SafeParseResult<T> = Result<T> | { success: false; error: ValidationError };

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
  issues?: ValidationError[];
}

export type ParseResult<T> = Result<T>;

export type SchemaType<T> = T extends Schema<infer U> ? U : never;

export type InputType<T> = T extends Schema<infer U> ? U : never;

export type OutputType<T> = T extends Schema<infer U> ? U : never;
