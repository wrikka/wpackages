/**
 * Services - Effect Handlers
 *
 * Side effects management
 */

// Dependency Injection
export {
	Container,
	container,
	inject,
	injectMany,
	provide,
	provideWithFactory,
	Service,
	type ServiceFactory,
	type ServiceOptions,
	withDeps,
} from "./di.service";

// Concurrency
export { Mutex, Ref, Semaphore } from "./concurrency.service";

// Fiber-based Concurrency
export {
	Fiber,
	type FiberId,
	FiberRuntime,
	fiberRuntime,
	type FiberStatus,
	fork,
	runFork,
	runForkAll,
	runRaceAll,
} from "./fiber";

// Resource Management
export { Pool } from "./pool.service";
export { makeResource, scoped, use } from "./resource.service";
export type { Resource } from "./resource.service";
export { type Exit, type Finalizer, Scope } from "./scope.service";

// Cache - Re-export from caching package
// export type { Cache as Cache, CacheConfig, CacheEntry, CacheStats } from "caching";
// export { createCache, memoize, memoizeAsync } from "caching";

// Retry - Re-export from resilience package
// export {
// 	createRetryPolicy,
// 	defaultRetryConfig as retryPolicies,
// 	retry as retryAsync,
// 	retry as retrySync,
// 	retryEffect,
// 	type RetryOptions,
// 	type RetryResult,
// 	type RetryStrategy,
// } from "resilience/services/retry";

// Tracing and Observability - Re-export from observability package
// export type {
// 	Span as Span,
// 	SpanContext as SpanContext,
// 	SpanEvent as SpanEvent,
// 	SpanOptions as SpanOptions,
// 	SpanStatus as SpanStatus,
// 	Tracer as Tracer,
// } from "observability";

// Configuration Management - Re-export from config-manager package
// export {
// 	type ConfigError,
// 	ConfigManager,
// 	type ConfigOptions,
// 	type ConfigSchema,
// 	type ConfigSource,
// 	createConfigManager,
// 	loadConfig as loadConfig,
// 	type LoadedConfig,
// } from "config-manager";

// Streaming - Re-export from stream package
// export { Stream } from "stream"; // package not available

// Testing - Re-export from testing package
// export { describe, expect, only, skip, test } from "testing";

// export type { TestResult, TestSuite } from "testing";
