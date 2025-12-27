import { Schema } from '@effect/schema';
import * as E from '../../types';

export function conflictError(
	message: string,
	options?: {
		conflictingResource?: string;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.ConflictError {
	return Schema.decodeUnknownSync(E.ConflictError)({ name: "ConflictError", message, ...options });
}
