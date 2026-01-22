export const DEFAULT_PORT = 3000;

export const DEFAULT_HOST = "localhost";

export const HTTP_STATUS_CODES = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	SERVICE_UNAVAILABLE: 503,
} as const;

export const CONTENT_TYPES = {
	JSON: "application/json",
	TEXT: "text/plain",
	HTML: "text/html",
	FORM: "application/x-www-form-urlencoded",
	MULTIPART: "multipart/form-data",
} as const;

export const HEADERS = {
	CONTENT_TYPE: "content-type",
	CONTENT_LENGTH: "content-length",
	AUTHORIZATION: "authorization",
	ACCEPT: "accept",
	USER_AGENT: "user-agent",
} as const;

export const ERROR_MESSAGES = {
	ROUTE_NOT_FOUND: "Route not found",
	METHOD_NOT_ALLOWED: "Method not allowed",
	BAD_REQUEST: "Bad request",
	UNAUTHORIZED: "Unauthorized",
	FORBIDDEN: "Forbidden",
	INTERNAL_SERVER_ERROR: "Internal server error",
	NOT_IMPLEMENTED: "Not implemented",
} as const;
