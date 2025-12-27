import { Schema } from '@effect/schema';
import * as E from '../../types';

export function forbiddenError(
	message: string,
	options?: {
		action?: string;
		resource?: string;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.ForbiddenError {
	return Schema.decodeUnknownSync(E.ForbiddenError)({ name: "ForbiddenError", message, ...options });
}
