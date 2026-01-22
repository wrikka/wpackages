export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export type RouteParams = Record<string, string | number | boolean>;

export type RouteHandler<R = unknown, E = unknown, A = unknown> = (
	request: Request,
	params: RouteParams,
) => Promise<A> | A;

export type RouteDefinition<R = unknown, E = unknown, A = unknown> = {
	readonly method: HttpMethod;
	readonly path: string;
	readonly handler: RouteHandler<R, E, A>;
	readonly description?: string;
};

export type ServerConfig = {
	readonly port: number;
	readonly host: string;
	readonly env?: "development" | "production" | "test";
};

export type Middleware = (
	request: Request,
	next: () => Promise<Response>,
) => Promise<Response> | Response;

export type ErrorResponse = {
	readonly error: string;
	readonly message?: string;
	readonly statusCode?: number;
};

export type RouteSchema = {
	readonly query?: Record<string, unknown>;
	readonly body?: Record<string, unknown>;
	readonly response?: Record<string, unknown>;
};

export type RouteWithSchema<R = unknown, E = unknown, A = unknown> = RouteDefinition<R, E, A> & {
	readonly schema?: RouteSchema;
};
