/**
 * schema - Functional Schema Validation Library
 *
 * A comprehensive schema validation library built with functional programming principles.
 *
 * @example
 * ```ts
 * import { string, number, object } from 'schema';
 *
 * const userSchema = object({
 *   name: string({ min: 1 }),
 *   age: number({ min: 0 })
 * });
 *
 * const result = userSchema.parse({ name: 'Alice', age: 30 });
 * ```
 */

export * from "./schemas/string";
export * from "./schemas/number";
export * from "./schemas/object";
export * from "./schemas/array";
export * from "./schemas/union";
export * from "./schemas/literal";
export * from "./schemas/optional";
export * from "./components";
export * from "./errors";
export * from "./types";
export * from "./builder";
