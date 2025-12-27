import { Schema } from '@effect/schema';
import * as E from '../../types';

export function httpError(
	message: string,
	status: number,
	options?: {
		statusText?: string;
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.HttpError {
	return Schema.decodeUnknownSync(E.HttpError)({ name: "HttpError", message, status, ...options });
}

export function badRequestError(
	message: string,
	options?: {
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.HttpError {
	return httpError(message, 400, { statusText: 'Bad Request', ...options });
}

export function internalServerError(
	message: string,
	options?: {
		code?: string;
		metadata?: Record<string, unknown>;
		cause?: Error;
	},
): E.HttpError {
	return httpError(message, 500, { statusText: 'Internal Server Error', ...options });
}
