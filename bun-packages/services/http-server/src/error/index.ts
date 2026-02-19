import type { H3Event } from "../types";

export class HttpServerError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "HttpServerError";
  }
}

export function createError(
  statusCode: number,
  message: string,
  code?: string
): HttpServerError {
  return new HttpServerError(message, statusCode, code);
}

export function handleError(error: unknown, _event: H3Event): Response {
  if (error instanceof HttpServerError) {
    return new Response(error.message, {
      status: error.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (error instanceof Error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Internal Server Error", {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
}
