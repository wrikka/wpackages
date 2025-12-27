import { Schema } from '@effect/schema';
import * as E from '../../types';

export function fromError(error: Error): E.AppError {
	return Schema.decodeUnknownSync(E.AppError)({ name: "AppError", message: error.message, cause: error });
}

export function fromUnknown(error: unknown): E.AppError {
	if (error instanceof Error) {
		return fromError(error);
	}

	return Schema.decodeUnknownSync(E.AppError)({ name: "AppError", message: String(error) });
}
