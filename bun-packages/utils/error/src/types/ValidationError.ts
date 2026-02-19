import { Data } from "effect";

/**
 * Represents an error for validation failures.
 * Defaults to a 400 Bad Request status code.
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{ message: string; isOperational?: boolean }> {
	get statusCode(): number {
		return 400;
	}
}
