import type { RouteParams } from "../types";

export const parsePathParams = (() => {
	const cache = new Map<string, (pathname: string) => RouteParams | null>();
	
	return (path: string, pathname: string): RouteParams | null => {
		// Check cache first
		if (cache.has(path)) {
			return cache.get(path)!(pathname);
		}
		
		const pathSegments = path.split("/").filter(Boolean);
		const hasParams = pathSegments.some(seg => seg.startsWith(":"));
		
		if (!hasParams) {
			// Fast path: no params, just check exact match
			cache.set(path, (pn) => path === pn ? {} : null);
			return path === pathname ? {} : null;
		}
		
		// Create optimized matcher function
		const matcher = (pn: string): RouteParams | null => {
			const pnSegments = pn.split("/").filter(Boolean);
			if (pathSegments.length !== pnSegments.length) return null;
			
			const params: RouteParams = {};
			for (let i = 0; i < pathSegments.length; i++) {
				const pathSeg = pathSegments[i];
				const pnSeg = pnSegments[i];
				
				if (!pathSeg || !pnSeg) return null;
				
				if (pathSeg.startsWith(":")) {
					params[pathSeg.slice(1)] = pnSeg;
				} else if (pathSeg !== pnSeg) {
					return null;
				}
			}
			return params;
		};
		
		cache.set(path, matcher);
		return matcher(pathname);
	};
})();

// Pre-allocated headers for performance
const JSON_HEADERS = { "Content-Type": "application/json" };
const ERROR_HEADERS = { "Content-Type": "application/json" };

export const createResponse = (
	data: unknown,
	status: number = 200,
	headers: HeadersInit = JSON_HEADERS,
): Response => {
	return new Response(JSON.stringify(data), {
		status,
		headers,
	});
};

export const createErrorResponse = (
	error: string,
	status: number = 500,
	message?: string,
): Response => {
	return new Response(
		JSON.stringify({ error, message }),
		{
			status,
			headers: ERROR_HEADERS,
		},
	);
};

export const matchRoute = (
	routes: ReadonlyArray<{ readonly method: string; readonly path: string }>,
	request: Request,
): { route: { readonly method: string; readonly path: string }; params: RouteParams } | null => {
	const url = new URL(request.url);
	const pathname = url.pathname;
	const method = request.method;

	for (const route of routes) {
		if (route.method !== method) {
			continue;
		}

		const params = parsePathParams(route.path, pathname);
		if (params !== null) {
			return { route, params };
		}
	}

	return null;
};

export const parseQuery = (url: URL): Record<string, string> => {
	const params = new URLSearchParams(url.search);
	const query: Record<string, string> = {};

	for (const [key, value] of params.entries()) {
		query[key] = value;
	}

	return query;
};

export const isValidHttpMethod = (method: string): method is "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" => {
	return ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(method);
};

export * from "./validation.js";
