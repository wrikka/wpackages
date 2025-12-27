import { Schema } from '@effect/schema';
import * as E from '../../types';

export function createErrorFactory<T extends Record<string, Schema.Schema<any>>>(
	name: string,
	extraFields: T,
) {
	const schema = Schema.Struct({
		...E.BaseError.fields,
		name: Schema.Literal(name),
		...extraFields,
	});

	type ErrorType = Schema.Schema.Type<typeof schema>;
	type Options = Omit<ErrorType, 'name' | 'message'>;

	function creator(message: string, options: Options): ErrorType {
		// Construct the object directly, relying on TypeScript's type checking.
		// This avoids complex schema inference issues at runtime.
		return { name, message, ...options } as ErrorType;
	}

	return { schema, creator };
}
