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

// Types
export type {} from "./types/index.js";


// Utils
export {} from "./utils/index.js";


// Constants
export {} from "./constant/index.js";

// Lib
export {} from "./lib/index.js";
