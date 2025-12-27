import { Schema } from '@effect/schema';
import * as E from '../../types';

export function networkError(
	message: string,
	options?: {
		url?: string;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.NetworkError {
	return Schema.decodeUnknownSync(E.NetworkError)({ name: "NetworkError", message, ...options });
}
