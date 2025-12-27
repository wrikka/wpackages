/**
 * program - Functional Programming Facade
 *
 * Single entry point สำหรับ @wts functional programming ecosystem
 *
 * แนะนำ: ใช้ packages โดยตรง (functional, signals, etc.)
 * เพื่อ tree-shaking ที่ดีกว่า
 */

// ============================================
// functional - Core Functional Primitives
// ============================================

export {
	// Option
	combineOptions,
	combineResults,
	filter,
	fromNullable,
	isNone,
	isSome,
	none,
	type Option,
	some,
	// Result
	err,
	ok,
	type Result,
	// Composition
	compose,
	constant,
	flow,
	identity,
	pipe,
	tap,
} from "functional";

// ============================================
// error - Type-safe Errors
// ============================================

export type {
	AnyError,
	AppError,
	ConflictError,
	DatabaseError,
	ForbiddenError,
	HttpError,
	NetworkError,
	NotFoundError,
	TimeoutError,
	UnauthorizedError,
	ValidationError,
} from "error";

export {
	appError,
	conflictError,
	databaseError,
	forbiddenError,
	fromError,
	fromUnknown,
	httpError,
	networkError,
	notFoundError,
	timeoutError,
	unauthorizedError,
	validationError,
} from "error";

// ============================================
// stream - Asynchronous Streams
// ============================================

// export { Stream } from "stream"; // package not available

// ============================================
// signals - Reactive State
// ============================================

// Note: signals package is not yet built, uncomment when ready
// export {
// 	ref,
// 	shallowRef,
// 	computed,
// 	effect,
// 	watchEffect,
// 	watch,
// 	watchMultiple,
// 	batch,
// 	batchAsync,
// 	untrack,
// 	isRef,
// 	isComputed,
// 	isReactive,
// 	toRef,
// 	unref,
// 	toRaw,
// } from 'signals';

// export type {
// 	Ref,
// 	Computed,
// 	EffectCleanup,
// 	EffectFunction,
// 	WatchCallback,
// 	WatchOptions,
// 	BatchOptions,
// } from 'signals';

// ============================================
// utils - Functional Utilities
// ============================================

// Note: Import only if needed
// export { pipe, compose, curry } from 'utils';

// ============================================
// program - Services
// ============================================

export {
	// DI
	Container,
	container,
	// Fiber-based Concurrency
	Fiber,
	type FiberId,
	FiberRuntime,
	fiberRuntime,
	type FiberStatus,
	fork,
	inject,
	injectMany,
	makeResource,
	Pool,
	provide,
	provideWithFactory,
	type Resource,
	runFork,
	runForkAll,
	runRaceAll,
	// Resource Management
	Scope,
	scoped,
	Service,
	type ServiceFactory,
	type ServiceOptions,
	withDeps,
} from "./services";

// Config Module
export type {
	CacheConfig,
	ConcurrencyConfig,
	ConfigBuilder,
	ConfigManagerOptions,
	EffectConfig,
	EffectPlugin,
	PluginContext,
	PluginHooks,
} from "./config";

export {
	createConfigBuilder,
	createPluginManager,
	createProgramConfigManager,
	defineConfig,
	EffectPluginManager,
	getConfig,
	initConfig,
	loadConfigFromFile,
	loadConfigWithManager,
	mergeConfig,
	resetConfig,
	resolveConfig,
	setConfig,
} from "./config";

// Components
export type { Component, ErrorComponent, ProgramComponent, ProgramComponentProps, SuccessComponent } from "./components";

// Utilities
export { deepMerge, formatBuildTime, formatBytes, mergeUnique, normalizeInput } from "./utils";

// ============================================
// Note
// ============================================

/**
 * แนะนำให้ import โดยตรงจาก packages แทนการใช้ facade นี้:
 *
 * @example
 * ```typescript
 * // ✅ ดี - tree-shaking ได้ดี
 * import { ok, err } from 'functional';
 * import { ref, computed, effect, watch, batch } from 'reactivity';
 *
 * // ⚠️ OK แต่ไม่ค่อยดี
 * import { ok, err, ref, computed } from 'program';
 * ```
 */
