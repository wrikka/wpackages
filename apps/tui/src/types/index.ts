// Export display component types
export type {
	BoxProps,
	CodeBlockProps,
	DividerProps,
	ProgressProps,
	SpinnerProps,
	StatusProps,
	TableProps,
	TextProps,
	StyleConfig,
} from "./display";

import type { Effect } from "effect";

/**
 * Core types for TUI application
 */

export * from "./command.types";
export * from "./config.types";
export * from "./extended.types";
export * from "./hooks.types";
export * from "./middleware.types";
export * from "./plugin.types";
export * from "./prompt.types";

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = Effect.Effect<T, E>;

/**
 * Async result type for operations that are asynchronous
 */
export type AsyncResult<T, E = Error> = Effect.Effect<Promise<T>, E>;

/**
 * A function that takes input of type I and returns a Result of type O
 */
export type EffectFn<I, O, E = Error> = (input: I) => Result<O, E>;

/**
 * A function that takes input of type I and returns an AsyncResult of type O
 */
export type AsyncEffectFn<I, O, E = Error> = (input: I) => AsyncResult<O, E>;

/**
 * A function that takes input of type I and returns a Promise of type O
 */
export type PromiseFn<I, O> = (input: I) => Promise<O>;

/**
 * A function that takes input of type I and returns void
 */
export type SideEffectFn<I = void> = (input: I) => void;

/**
 * A function that takes input of type I and returns a Promise of void
 */
export type AsyncSideEffectFn<I = void> = (input: I) => Promise<void>;
