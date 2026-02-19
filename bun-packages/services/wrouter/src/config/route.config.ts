import type { HttpMethod } from "../types";
import { DEFAULT_ROUTE_EXTENSIONS } from "../constants";

export const RouteConfig = Object.freeze({
	extensions: DEFAULT_ROUTE_EXTENSIONS,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as readonly HttpMethod[],
	strict: false,
	trailingSlash: false,
} as const);
