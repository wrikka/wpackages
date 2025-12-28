/**
 * Middleware Service - Effect Handler
 * Compose and execute middleware chain
 */

import type { MiddlewareContext, MiddlewareDef, MiddlewareFunction } from "../types";

// Simple Result type
type ResultType<E, A> = { _tag: "Success"; value: A } | { _tag: "Failure"; error: E };

/**
 * Compose middleware functions into single function
 */
export const composeMiddleware = (
	middlewares: readonly MiddlewareDef[],
): MiddlewareFunction => {
	const sorted = [...middlewares].sort(
		(a, b) => (a.order ?? 0) - (b.order ?? 0),
	);

	return async (context, next) => {
		let index = -1;

		const dispatch = async (
			i: number,
		): Promise<ResultType<string, void>> => {
			if (i <= index) {
				return { _tag: "Failure", error: "next() called multiple times" };
			}

			index = i;

			if (i === sorted.length) {
				return await next();
			}

			const middleware = sorted[i];
			if (!middleware) {
				return await next();
			}

			return await middleware.fn(context, () => dispatch(i + 1));
		};

		return await dispatch(0);
	};
};

/**
 * Execute middleware chain
 */
export const executeMiddleware = async (
	middlewares: readonly MiddlewareDef[],
	context: MiddlewareContext,
	finalHandler: () => Promise<ResultType<string, void>>,
): Promise<ResultType<string, void>> => {
	if (middlewares.length === 0) {
		return await finalHandler();
	}

	const composed = composeMiddleware(middlewares);
	return await composed(context, finalHandler);
};

/**
 * Create logging middleware
 */
export const createLoggingMiddleware = (
	name = "logging",
	order = 0,
): MiddlewareDef => ({
	fn: async (context, next) => {
		const start = Date.now();
		console.log(
			`[${context.program.name}] Starting command: ${context.parsed.command || "default"}`,
		);

		const result = await next();

		const duration = Date.now() - start;
		console.log(`[${context.program.name}] Completed in ${duration}ms`);

		return result;
	},
	name,
	order,
});

/**
 * Create validation middleware
 */
export const createValidationMiddleware = (
	validator: (context: MiddlewareContext) => ResultType<string, void>,
	name = "validation",
	order = -10,
): MiddlewareDef => ({
	fn: async (context, next) => {
		const validationResult = validator(context);

		if (validationResult._tag === "Failure") {
			return validationResult;
		}

		return await next();
	},
	name,
	order,
});

/**
 * Create error handling middleware
 */
export const createErrorHandlingMiddleware = (
	handler: (error: unknown) => Promise<void>,
	name = "error-handling",
	order = 1000,
): MiddlewareDef => ({
	fn: async (_context, next) => {
		try {
			return await next();
		} catch (error) {
			await handler(error);
			return { _tag: "Failure", error: `Unhandled error: ${error}` };
		}
	},
	name,
	order,
});
