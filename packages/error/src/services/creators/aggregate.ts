import { Schema } from '@effect/schema';
import * as E from '../../types';

export function aggregateErrors(
	errors: E.WottvError[],
	message = 'Multiple errors occurred',
	options?: {
		code?: string;
		metadata?: Record<string, unknown>;
	},
): E.AggregateError {
	return Schema.decodeUnknownSync(E.AggregateError)({ 
		name: 'AggregateError', 
		message, 
		errors, 
		...options 
	});
}
