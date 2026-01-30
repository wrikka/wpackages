import type { Schema, ValidationError } from "@wpackages/schema";

/**
 * Validate request body/query/params against schema
 */
export function validateSchema<T>(
	schema: Schema<T>,
	value: unknown,
	_path: string = "",
): { success: true; data: T } | { success: false; error: ValidationError } {
	const result = schema.safeParse(value);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, error: result.error };
}

/**
 * Parse and validate JSON body from request
 */
export async function parseJsonBody<T>(
	request: Request,
	schema?: Schema<T>,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
	try {
		const body = await request.json();
		if (schema) {
			const result = validateSchema(schema, body, "body");
			if (!result.success) {
				return { success: false, error: formatValidationError(result.error) };
			}
			return { success: true, data: result.data as T };
		}
		return { success: true, data: body as T };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to parse JSON body",
		};
	}
}

/**
 * Parse and validate query parameters
 */
export function parseQuery<T>(
	url: URL,
	schema?: Schema<T>,
): { success: true; data: T } | { success: false; error: string } {
	const query: Record<string, string> = {};
	url.searchParams.forEach((value, key) => {
		query[key] = value;
	});

	if (schema) {
		const result = validateSchema(schema, query, "query");
		if (!result.success) {
			return { success: false, error: formatValidationError(result.error) };
		}
		return { success: true, data: result.data as T };
	}

	return { success: true, data: query as T };
}

/**
 * Format validation error for HTTP response
 */
function formatValidationError(error: ValidationError): string {
	const path = error.path.length > 0 ? error.path.join(".") : "root";
	return `Validation error at ${path}: ${error.message}`;
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(error: ValidationError): Response {
	const path = error.path.length > 0 ? error.path.join(".") : "root";
	return new Response(
		JSON.stringify({
			error: "Validation Error",
			message: error.message,
			path,
		}),
		{
			status: 400,
			headers: { "Content-Type": "application/json" },
		},
	);
}
