import type { RouteInfo } from "../scanner";

/**
 * Generate OpenAPI spec from routes
 */
export function generateOpenApi(routes: RouteInfo[]): string {
	const openApi = {
		openapi: "3.0.0",
		info: {
			title: "WebServer API",
			version: "1.0.0",
		},
		paths: {} as Record<string, any>,
	};

	for (const { route } of routes) {
		const path = route.path;
		const method = route.method.toLowerCase();

		if (!openApi.paths[path]) {
			openApi.paths[path] = {};
		}

		openApi.paths[path][method] = {
			summary: `${method.toUpperCase()} ${path}`,
			responses: {
				200: {
					description: "Success",
					content: {
						"application/json": {
							schema: {
								type: "object",
							},
						},
					},
				},
				400: {
					description: "Bad Request",
				},
				404: {
					description: "Not Found",
				},
				500: {
					description: "Internal Server Error",
				},
			},
		};
	}

	return JSON.stringify(openApi, null, 2);
}
