import { Schema } from '@effect/schema';
import * as E from '../../types';

export function timeoutError(
	message: string,
	timeout: number,
	options?: {
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.TimeoutError {
	return Schema.decodeUnknownSync(E.TimeoutError)({ name: "TimeoutError", message, timeout, ...options });
}
