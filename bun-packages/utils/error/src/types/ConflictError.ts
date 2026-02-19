import { Data } from "effect";

/**
 * Represents an error for resource conflicts.
 * Defaults to a 409 Conflict status code.
 */
export class ConflictError extends Data.TaggedError("ConflictError")<{
	message: string;
	statusCode?: number;
	isOperational?: boolean;
	cause?: unknown;
}> {}
