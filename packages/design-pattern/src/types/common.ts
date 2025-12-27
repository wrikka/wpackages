/**
 * Common types for design patterns
 * Pure type definitions without side effects
 */

/**
 * Base pattern type
 */
export interface Pattern<T = unknown> {
	readonly type: string;
	readonly value: T;
}

/**
 * Factory function type
 */
export type Factory<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * Builder step type
 */
export type BuilderStep<TState, TResult> = (state: TState) => TResult;

/**
 * Strategy function type
 */
export type Strategy<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * Observer callback type
 */
export type Observer<T> = (value: T) => void;

/**
 * Command interface
 */
export interface Command<TResult = void> {
	readonly execute: () => TResult;
	readonly undo?: () => TResult;
}

/**
 * Handler for chain of responsibility
 */
export type Handler<TInput, TOutput> = (
	input: TInput,
) => TOutput | undefined;

/**
 * Visitor interface
 */
export interface Visitor<T, TResult> {
	readonly visit: (element: T) => TResult;
}

/**
 * State interface
 */
export interface State<TContext, TResult> {
	readonly handle: (context: TContext) => TResult;
}

/**
 * Mediator message type
 */
export interface Message<T = unknown> {
	readonly type: string;
	readonly payload: T;
}
