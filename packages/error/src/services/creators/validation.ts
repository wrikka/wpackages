import { Schema } from '@effect/schema';
import * as E from '../../types';

export function validationError(
	message: string,
	options?: {
		field?: string;
		value?: unknown;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.ValidationError {
	return Schema.decodeUnknownSync(E.ValidationError)({ name: "ValidationError", message, ...options });
}
