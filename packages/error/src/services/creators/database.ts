import { Schema } from '@effect/schema';
import * as E from '../../types';

export function databaseError(
	message: string,
	options?: {
		query?: string;
		table?: string;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.DatabaseError {
	return Schema.decodeUnknownSync(E.DatabaseError)({ name: "DatabaseError", message, ...options });
}
