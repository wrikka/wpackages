import { Schema } from '@effect/schema';
import * as E from '../../types';

export function unauthorizedError(
	message: string,
	options?: {
		realm?: string;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.UnauthorizedError {
	return Schema.decodeUnknownSync(E.UnauthorizedError)({ name: "UnauthorizedError", message, ...options });
}
