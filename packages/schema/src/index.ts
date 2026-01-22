/**
 * @wpackages/schema - High-performance schema validation library
 * Better than Zod and Effect Schema with custom implementation
 */

// Core types
export type * from "./types/core.js";

// Core schema
export { BaseSchema, createSchema } from "./core/schema.js";

// Primitive schemas
export {
  string,
  number,
  boolean,
  date,
  literal,
  any,
  unknown,
  never,
} from "./schemas/primitives.js";

// Composite schemas
export {
  object,
  array,
  union,
  intersection,
  tuple,
  record,
  enum_,
} from "./schemas/composite.js";

// Validation utilities
export {
  email,
  url,
  uuid,
  minLength,
  maxLength,
  pattern,
  min,
  max,
  positive,
  negative,
  integer,
  nonEmpty,
  minItems,
  maxItems,
  minDate,
  maxDate,
} from "./utils/validation.js";

// Error handling
export {
  SchemaValidationError,
  formatError,
  mergeErrors,
} from "./error/validation-error.js";

// Re-export Schema type for convenience
export type { Schema } from "./types/core.js";
