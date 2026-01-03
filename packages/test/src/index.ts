/**
 * @wts/test - Type-safe, functional testing framework
 */

// Core types
export type * from "./types";

// Configuration
export type { TestConfig } from "./config";
export { defineConfig } from "./config";

// Constants
export * from "./constant";

// Core assertion logic
export * from "./components";

// All testing utilities
export * from "./utils";

// Reporter services
export * from "./services";

// Property-Based Testing
export { it } from "./property";
export * as fc from "fast-check";

// Note: Core vitest utilities (describe, test, etc.) should be imported directly from 'vitest'
// Example: import { describe, test } from 'vitest'
