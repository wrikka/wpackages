import type { HttpMethod } from "../types";

export const HTTP_METHODS = Object.freeze<HttpMethod[]>(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]);

export const ROUTE_PRIORITY = Object.freeze({
	STATIC: 3,
	DYNAMIC: 2,
	WILDCARD: 1,
} as const);

export const DEFAULT_ROUTE_EXTENSIONS = Object.freeze([".vue", ".tsx", ".jsx", ".ts", ".js"] as const);
