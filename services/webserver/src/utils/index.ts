import type { RouteParams } from "../types";

export const parsePathParams = (path: string, pathname: string): RouteParams | null => {
	const pathSegments = path.split("/").filter(Boolean);
	const pathnameSegments = pathname.split("/").filter(Boolean);

	if (pathSegments.length !== pathnameSegments.length) {
		return null;
	}

	const params: RouteParams = {};

	for (let i = 0; i < pathSegments.length; i++) {
		const pathSegment = pathSegments[i];
		const pathnameSegment = pathnameSegments[i];

		if (!pathSegment || !pathnameSegment) {
			return null;
		}

		if (pathSegment.startsWith(":")) {
			params[pathSegment.slice(1)] = pathnameSegment;
		} else if (pathSegment !== pathnameSegment) {
			return null;
		}
	}

	return params;
};

export const createResponse = (
	data: unknown,
	status: number = 200,
	headers: HeadersInit = {},
): Response => {
	const responseHeaders = new Headers(headers);
	responseHeaders.set("Content-Type", "application/json");

	return new Response(JSON.stringify(data), {
		status,
		headers: responseHeaders,
	});
};

export const createErrorResponse = (
	error: string,
	status: number = 500,
	message?: string,
): Response => {
	return createResponse(
		{
			error,
			message,
		},
		status,
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
