import { Schema } from '@effect/schema';
import * as E from '../../types';

export function appError(
	message: string,
	options?: {
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.AppError {
	return Schema.decodeUnknownSync(E.AppError)({ name: "AppError", message, ...options });
}
