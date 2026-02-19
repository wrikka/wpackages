import * as Schema from "@effect/schema/Schema";
import { Effect } from "effect";

// Represents the final API definition
export type Api<T extends Record<string, Handler> = Record<string, Handler>> = {
	handlers: T;
};

// Represents a single API endpoint handler
export type Handler = {
	method: "POST" | "GET" | "PUT" | "DELETE";
	path: string;
	handler: (input: any) => Effect.Effect<unknown, unknown, unknown>;
	schema?: {
		body?: Schema.Schema<any, any>;
		response?: Schema.Schema<any, any>;
	};
};

/**
 * The main API builder instance.
 */
export const builder = <THandlers extends Record<string, Handler>>(
	initialHandlers: THandlers = {} as THandlers,
) => {
	const handlers = { ...initialHandlers };

	const builderInstance = {
		/**
		 * Defines a POST endpoint.
		 */
		post: <
			const Name extends string,
			const R,
			const E,
			const A,
			const BodySchema extends Schema.Schema<any, any> | undefined = undefined,
		>(
			name: Name,
			path: string,
			options: {
				schema?: {
					body?: BodySchema;
					response?: Schema.Schema<A, any>;
				};
				handler: (
					input: BodySchema extends Schema.Schema<any, any> ? Schema.Schema.Type<BodySchema> : undefined,
				) => Effect.Effect<R, E, A>;
			},
		) => {
			const newHandler: Handler = {
				method: "POST" as const,
				path,
				handler: options.handler as (input: any) => Effect.Effect<any, any, any>,
				schema: options.schema,
			};

			return builder(
				{
					...handlers,
					[name]: newHandler,
				} as THandlers & { [K in Name]: typeof newHandler },
			);
		},

		/**
		 * Builds the final API definition.
		 */
		build: (): Api<THandlers> => ({ handlers }),

		/**
		 * Exports the type of the API for client-side type safety.
		 */
		get type() {
			return this.build();
		},
	};

	return builderInstance;
};
