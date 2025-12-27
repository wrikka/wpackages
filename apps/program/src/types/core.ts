/**
 * Core Types
 *
 * Type definitions ที่ใช้ทั่วทั้งระบบ
 * ปฏิบัติตาม functional programming principles
 */

/**
 * Tag สำหรับแยก Result types
 */
export type Tag = "Ok" | "Err";

/**
 * Tag สำหรับแยก Option types (Rust-style)
 */
export type OptionTag = "Some" | "None";

/**
 * Tag สำหรับแยก Maybe types (deprecated - use OptionTag)
 * @deprecated Use OptionTag instead
 */
export type MaybeTag = OptionTag;

/**
 * Lazy value - สำหรับ evaluation แบบ lazy
 */
export type Lazy<A> = () => A;

/**
 * Predicate function
 */
export type Predicate<A> = (value: A) => boolean;

/**
 * Refinement - type guard
 */
export type Refinement<A, B extends A> = (value: A) => value is B;

/**
 * Unary function
 */
export type Unary<A, B> = (value: A) => B;

/**
 * Binary function
 */
export type Binary<A, B, C> = (a: A, b: B) => C;

/**
 * Match pattern สำหรับ Result
 */
export interface ResultMatcher<E, A, B> {
	readonly ok: (value: A) => B;
	readonly err: (error: E) => B;
}

/**
 * Match pattern สำหรับ Option (Rust-style)
 */
export interface OptionMatcher<T, R> {
	readonly some: (value: T) => R;
	readonly none: () => R;
}

/**
 * Match pattern สำหรับ Maybe (deprecated - use OptionMatcher)
 * @deprecated Use OptionMatcher instead
 */
export type MaybeMatcher<T, R> = OptionMatcher<T, R>;

/**
 * Retry configuration
 */
export interface RetryConfig {
	readonly maxAttempts: number;
	readonly delay?: number;
	readonly backoff?: "constant" | "linear" | "exponential";
	readonly onRetry?: (attempt: number) => void;
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
	readonly ms: number;
	readonly message?: string;
}

/**
 * Recovery configuration
 */
export interface RecoveryConfig<E, A> {
	readonly default?: (error: E) => ResultLike<A, E> | A;
	readonly [key: string]: ((error: E) => ResultLike<A, E> | A) | undefined;
}

/**
 * Circuit Breaker configuration
 */
export interface CircuitBreakerConfig {
	readonly threshold: number;
	readonly timeout: number;
	readonly halfOpenAttempts: number;
}

/**
 * Rate Limiter configuration
 */
export interface RateLimitConfig {
	readonly requests: number;
	readonly window: number;
	readonly strategy: "sliding" | "fixed";
}

/**
 * Bulkhead configuration
 */
export interface BulkheadConfig {
	readonly maxConcurrent: number;
	readonly maxQueue: number;
}

/**
 * Result-like interface สำหรับ compatibility
 */
export interface ResultLike<A, E = unknown> {
	readonly _tag: Tag;
	readonly value?: A;
	readonly error?: E;
}

/**
 * Option-like interface (Rust-style)
 */
export interface OptionLike<T> {
	readonly _tag: OptionTag;
	readonly value?: T;
}

/**
 * Maybe-like interface (deprecated - use OptionLike)
 * @deprecated Use OptionLike instead
 */
export type MaybeLike<T> = OptionLike<T>;

/**
 * Task-like interface
 */
export type TaskLike<A, E = unknown> = () => Promise<ResultLike<A, E>>;
