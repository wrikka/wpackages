export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Server": "http-server",
} as const;

export const MIME_TYPES = {
  JSON: "application/json",
  TEXT: "text/plain",
  HTML: "text/html",
  CSS: "text/css",
  JAVASCRIPT: "application/javascript",
  FORM: "application/x-www-form-urlencoded",
} as const;
