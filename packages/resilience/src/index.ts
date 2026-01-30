/**
 * Resilience patterns and fault tolerance utilities
 *
 * A functional programming approach to building resilient applications
 * using Effect-TS for side effect management.
 */

// Core types and interfaces
export type { ResilienceConfig, ResilienceFunction, ResilienceResult } from "./types";

// Error classes
export { BulkheadRejectionError, CircuitBreakerOpenError, RateLimitExceededError, TimeoutError } from "./errors";

// Constants
export * from "./constant";

// Pure utility functions
export * from "./utils";

// Configuration management
export * from "./config";

// Effect handlers (single source of truth)
export * from "./services";

// Pure components (re-exports for backward compatibility)
export * from "./components";

// Third-party library wrappers
export * from "./lib";

// Application composition
export { createResilientFunction, execute, run } from "./app";

// Default configuration
export { defaultConfig } from "./config";
