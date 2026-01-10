import { HttpRouter } from "@effect/platform";
import { ResponseFactory } from "@wpackages/http-server";
import { Effect } from "effect";

const spec = {
	openapi: "3.0.3",
	info: {
		title: "WebServer API",
		version: "0.0.0",
	},
	paths: {
		"/": {
			get: {
				summary: "Hello World",
				responses: {
					"200": { description: "OK" },
				},
			},
		},
		"/healthz": {
			get: {
				summary: "Health check",
				responses: {
					"200": {
						description: "OK",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/HealthResponse" },
							},
						},
					},
				},
			},
		},
		"/readyz": {
			get: {
				summary: "Readiness check",
				responses: {
					"200": {
						description: "OK",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ReadyResponse" },
							},
						},
					},
					"503": {
						description: "Service Unavailable",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ReadyResponse" },
							},
						},
					},
				},
			},
		},
		"/users/{id}": {
			get: {
				summary: "Get user by id",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "integer" },
					},
				],
				security: [{ ApiKeyAuth: [] }],
				responses: {
					"200": {
						description: "OK",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/UserResponse" },
							},
						},
					},
					"401": { description: "Unauthorized" },
					"404": { description: "Not Found" },
				},
			},
		},
		"/metrics": {
			get: {
				summary: "Prometheus metrics",
				responses: {
					"200": {
						description: "OK",
						content: {
							"text/plain": {
								schema: { type: "string" },
							},
						},
					},
				},
			},
		},
		"/docs": {
			get: {
				summary: "HTML documentation",
				responses: {
					"200": {
						description: "OK",
						content: {
							"text/html": {
								schema: { type: "string" },
							},
						},
					},
				},
			},
		},
		"/openapi.json": {
			get: {
				summary: "OpenAPI specification",
				responses: {
					"200": {
						description: "OK",
						content: {
							"application/json": {
								schema: { type: "object" },
							},
						},
					},
				},
			},
		},
	},
	components: {
		securitySchemes: {
			ApiKeyAuth: {
				type: "apiKey",
				in: "header",
				name: "x-api-key",
			},
		},
		schemas: {
			HealthResponse: {
				type: "object",
				additionalProperties: false,
				properties: {
					ok: { type: "boolean" },
				},
				required: ["ok"],
			},
			ReadyResponse: {
				type: "object",
				additionalProperties: false,
				properties: {
					ready: { type: "boolean" },
					db: { type: "string", enum: ["ok", "disabled", "error"] },
				},
				required: ["ready", "db"],
			},
			User: {
				type: "object",
				additionalProperties: false,
				properties: {
					id: { type: "integer" },
					name: { type: "string" },
				},
				required: ["id", "name"],
			},
			UserResponse: {
				type: "object",
				additionalProperties: false,
				properties: {
					user: { $ref: "#/components/schemas/User" },
				},
				required: ["user"],
			},
		},
	},
} as const;

export const openapiRoute = HttpRouter.get(
	"/openapi.json",
	Effect.gen(function*() {
		const response = yield* ResponseFactory.Current;
		return yield* response.json(spec, {
			headers: {
				"content-type": "application/json; charset=utf-8",
			},
		});
	}),
);
