import * as Schema from "@effect/schema/Schema";
import { Effect } from "effect";
import { Api } from "./builder";

type Client<T extends Api> = {
	[K in keyof T["handlers"]]: T["handlers"][K] extends {
		method: "POST";
		schema?: {
			body?: Schema.Schema<any, any>;
			response?: Schema.Schema<any, any>;
		};
		handler: (input: any) => Effect.Effect<any, any, any>;
	} ? (
			body: T["handlers"][K]["schema"] extends { body: Schema.Schema<any, any> }
				? Schema.Schema.Type<T["handlers"][K]["schema"]["body"]>
				: undefined,
		) => Promise<
			T["handlers"][K]["schema"] extends { response: Schema.Schema<any, any> }
				? Schema.Schema.Type<T["handlers"][K]["schema"]["response"]>
				: unknown
		>
		: never;
};

export const createClient = <T extends Api>(url: string, api: T): Client<T> => {
	return new Proxy({} as Client<T>, {
		get(_target, prop, _receiver) {
			const endpointName = prop as keyof T["handlers"];
			const handlerDef = api.handlers[endpointName];

			if (!handlerDef) {
				return Promise.reject(new Error(`Endpoint ${String(endpointName)} not found`));
			}

			return async (body: any) => {
				const response = await fetch(`${url}${handlerDef.path}`, {
					method: handlerDef.method,
					headers: {
						"Content-Type": "application/json",
					},
					body: body ? JSON.stringify(body) : undefined,
				});

				if (!response.ok) {
					const errorBody = await response.text();
					throw new Error(`Request failed with status ${response.status}: ${errorBody}`);
				}

				return response.json();
			};
		},
	});
};
