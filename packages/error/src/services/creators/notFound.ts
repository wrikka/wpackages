import { Schema } from '@effect/schema';
import * as E from '../../types';

export function notFoundError(
	resource: string,
	id?: string | number,
	options?: {
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.NotFoundError {
	const message = id ? `${resource} with id "${id}" not found` : `${resource} not found`;
	return Schema.decodeUnknownSync(E.NotFoundError)({ name: "NotFoundError", message, resource, id, ...options });
}
