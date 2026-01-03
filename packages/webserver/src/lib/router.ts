import { Effect } from "effect";
import type { z } from "zod";
import { HttpError } from "../error";
import { parseBody } from "../utils/request";
import type { WContext } from "./context";

// --- Type Definitions ---
type ZodSchema = z.ZodTypeAny;

export interface RouteSchemas {
	body?: ZodSchema;
	params?: ZodSchema;
	query?: ZodSchema;
	response?: ZodSchema;
}

export type RouteContext<S extends RouteSchemas = {}> = WContext & {
	req: Request;
	body: S["body"] extends ZodSchema ? z.infer<S["body"]> : unknown;
	params: S["params"] extends ZodSchema ? z.infer<S["params"]>
		: Record<string, string>;
	query: S["query"] extends ZodSchema ? z.infer<S["query"]>
		: Record<string, string>;
};

export type EffectRouteHandler<S extends RouteSchemas, R, E> = (
	ctx: RouteContext<S>,
) => Effect.Effect<Response | object, E, R>;

interface Route {
	method: string;
	pattern: RegExp;
	paramNames: string[];
	handler: EffectRouteHandler<any, any, any>;
	schemas?: RouteSchemas;
}

// --- Router Class ---
export class Router {
	private routes: Route[] = [];

	private add<S extends RouteSchemas, R, E>(
		method: string,
		path: string,
		handler: EffectRouteHandler<S, R, E>,
		schemas?: S,
	) {
		const paramNames: string[] = [];
		const pattern = new RegExp(
			`^${
				path
					.split("/")
					.map((part) => {
						if (part.startsWith(":")) {
							paramNames.push(part.slice(1));
							return "([^/]+)";
						}
						return part;
					})
					.join("/")
			}$`,
		);

		const route: Route = { method, pattern, paramNames, handler };
		if (schemas) {
			route.schemas = schemas;
		}
		this.routes.push(route);
		return this;
	}

	get<S extends RouteSchemas, R, E>(
		path: string,
		handler: EffectRouteHandler<S, R, E>,
		schemas?: S,
	) {
		return this.add("GET", path, handler, schemas);
	}

	post<S extends RouteSchemas, R, E>(
		path: string,
		handler: EffectRouteHandler<S, R, E>,
		schemas?: S,
	) {
		return this.add("POST", path, handler, schemas);
	}

	handleEffect(
		req: Request,
		context: WContext,
	): Effect.Effect<Response, HttpError, any> {
		const url = new URL(req.url);
		const pathMatches = this.routes
			.map((route) => ({ route, match: route.pattern.exec(url.pathname) }))
			.filter((x) => x.match !== null);

		if (pathMatches.length === 0) {
			return Effect.fail(new HttpError(404, "Not Found"));
		}

		const matchForMethod = pathMatches.find(
			({ route }) => route.method === req.method,
		);

		if (!matchForMethod || !matchForMethod.match) {
			return Effect.fail(new HttpError(405, "Method Not Allowed"));
		}

		const { route, match } = matchForMethod;

		return Effect.gen(function*() {
			const body = yield* parseBodyEffect(req, route.schemas?.body);
			const params = yield* parseParamsEffect(
				match,
				route.paramNames,
				route.schemas?.params,
			);
			// TODO: Add query parsing

			const result = yield* route.handler({
				...context,
				req,
				body,
				params,
				query: {},
			});

			if (result instanceof Response) {
				return result;
			}

			const responseData = yield* validateResponseEffect(
				result,
				route.schemas?.response,
			);

			return new Response(JSON.stringify(responseData), {
				headers: { "Content-Type": "application/json" },
			});
		});
	}
}

// --- Helper Effects ---

function parseBodyEffect(req: Request, schema?: ZodSchema) {
	if (!schema) return Effect.succeed(undefined);
	return Effect.tryPromise({
		try: () => parseBody(req, schema),
		catch: (error) =>
			new HttpError(
				400,
				`Invalid body: ${error instanceof Error ? error.message : "Unknown error"}`,
			),
	});
}

function parseParamsEffect(
	match: RegExpExecArray,
	paramNames: string[],
	schema?: ZodSchema,
) {
	return Effect.try({
		try: () => {
			const params = paramNames.reduce(
				(acc, name, index) => {
					acc[name] = match[index + 1]!;
					return acc;
				},
				{} as Record<string, string>,
			);

			if (schema) {
				const parsed = schema.safeParse(params);
				if (!parsed.success) {
					throw new HttpError(400, `Invalid params: ${parsed.error.message}`);
				}
				return parsed.data;
			}
			return params;
		},
		catch: (error) =>
			error instanceof HttpError
				? error
				: new HttpError(500, "Internal error during param parsing"),
	});
}

function validateResponseEffect(data: unknown, schema?: ZodSchema) {
	if (!schema) return Effect.succeed(data);
	return Effect.try({
		try: () => {
			const parsed = schema.safeParse(data);
			if (!parsed.success) {
				console.error("Invalid response schema:", parsed.error);
				throw new HttpError(
					500,
					"Internal Server Error: Invalid response schema",
				);
			}
			return parsed.data;
		},
		catch: (error) =>
			error instanceof HttpError
				? error
				: new HttpError(500, "Internal error during response validation"),
	});
}
