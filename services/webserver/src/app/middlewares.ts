import type { Middleware, RouteWithSchema, RouteParams } from "../types";
import { validateSchema, createValidationErrorResponse, createErrorResponse } from "../utils";

/**
 * A middleware factory that creates a validation middleware for a given route schema.
 * It validates request params, query, and body.
 */
export const createValidationMiddleware = (
	route: RouteWithSchema,
	params: RouteParams,
): Middleware => {
	return async (request, next) => {
		const { schema } = route;
		if (!schema) {
			return next();
		}

		const url = new URL(request.url);
		let validatedParams = params;

		// 1. Validate Params
		if (schema.params) {
			const result = validateSchema(schema.params, params, "params");
			if (!result.success) {
				return createValidationErrorResponse(result.error);
			}
			validatedParams = result.data; // Use validated/coerced params
		}

		// 2. Validate Query
		if (schema.query) {
			const query: Record<string, string> = {};
			url.searchParams.forEach((value, key) => {
				query[key] = value;
			});
			const result = validateSchema(schema.query, query, "query");
			if (!result.success) {
				return createValidationErrorResponse(result.error);
			}
		}

		// 3. Validate Body
		if (schema.body && request.method !== "GET" && request.method !== "HEAD") {
			try {
				const body = await request.json();
				const result = validateSchema(schema.body, body, "body");
				if (!result.success) {
					return createValidationErrorResponse(result.error);
				}
			} catch (error) {
				return createErrorResponse(
					"Invalid JSON body",
					400,
					error instanceof Error ? error.message : undefined,
				);
			}
		}

		// Attach validated params to the request context if needed in the future
		// (request as any).params = validatedParams;

		return next();
	};
};
