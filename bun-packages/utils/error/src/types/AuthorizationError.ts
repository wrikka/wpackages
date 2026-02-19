import { Data } from "effect";

/**
 * Represents an error for authorization failures.
 * Defaults to a 403 Forbidden status code.
 */
export class AuthorizationError extends Data.TaggedError("AuthorizationError")<{
	message: string;
	statusCode?: number;
	isOperational?: boolean;
	cause?: unknown;
}> {}
