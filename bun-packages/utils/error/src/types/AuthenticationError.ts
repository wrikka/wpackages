import { Data } from "effect";

/**
 * Represents an error for authentication failures.
 * Defaults to a 401 Unauthorized status code.
 */
export class AuthenticationError extends Data.TaggedError("AuthenticationError")<{
	message: string;
	statusCode?: number;
	isOperational?: boolean;
	cause?: unknown;
}> {}
