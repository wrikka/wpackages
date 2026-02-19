import type { Effect } from "effect";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export type RouteParamType = "string" | "number" | "boolean";

export interface RouteParam {
	readonly name: string;
	readonly type: "string" | "number" | "boolean";
	readonly optional: boolean;
}

export interface RouteMatch<TRoute extends WRouteRecord<any, any> = WRouteRecord<any, any>> {
	readonly route: TRoute;
	readonly params: Readonly<Record<string, string | number | boolean>>;
	readonly query: Readonly<Record<string, string>>;
	readonly hash?: string;
}

export interface WRouteRecord<TParams = any, TMeta = any> {
	readonly path: string;
	readonly file: string;
	readonly name: string;
	readonly params: readonly RouteParam[];
	readonly methods: readonly HttpMethod[];
	readonly children?: readonly WRouteRecord<TParams, TMeta>[];
	readonly meta?: TMeta;
}

export interface GenerateRoutesOptions {
	readonly pagesDir: string;
	readonly extensions?: readonly string[];
	readonly base?: string;
}

export type RouteHandler = (
	request: Request,
	params: Readonly<Record<string, string | number | boolean>>,
) => Effect.Effect<Response, Error>;

export interface RouterOptions {
	readonly routes: readonly WRouteRecord[];
	readonly base?: string;
	readonly strict?: boolean;
}

export interface Location {
	readonly pathname: string;
	readonly search: string;
	readonly hash: string;
	readonly state: unknown;
}

export interface NavigationOptions {
	readonly replace?: boolean;
	readonly state?: unknown;
	readonly scroll?: boolean;
}

export interface MiddlewareContext {
	readonly request: Request;
	readonly params: Readonly<Record<string, string | number | boolean>>;
	readonly next: () => Effect.Effect<Response, Error>;
}

export interface Middleware {
	readonly name: string;
	readonly execute: (context: MiddlewareContext) => Effect.Effect<Response, Error>;
}

export interface RouteGuard {
	readonly name: string;
	readonly canActivate: (params: Readonly<Record<string, string | number | boolean>>) => Effect.Effect<boolean, Error>;
}

export interface RouteDataLoadResult<T> {
	readonly data: T;
	readonly status?: number;
}

export interface RouteDataLoader<T> {
	readonly load: (
		params: Readonly<Record<string, string | number | boolean>>,
	) => Effect.Effect<RouteDataLoadResult<T>, Error>;
}
