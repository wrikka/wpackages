import type { H3Event, H3EventHandler } from "../types";
import { HTTP_STATUS } from "../constants";

export interface MiddlewareOptions {
  cors?: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  };
  rateLimit?: {
    windowMs?: number;
    max?: number;
  };
  logging?: {
    enabled?: boolean;
    level?: 'debug' | 'info' | 'warn' | 'error';
  };
}

export interface Plugin {
  name: string;
  install: (app: any) => void | Promise<void>;
  uninstall?: (app: any) => void | Promise<void>;
}

export function createMiddleware(options: MiddlewareOptions = {}): H3EventHandler {
  return async (event: H3Event, next?: () => Promise<unknown>) => {
    // CORS middleware
    if (options.cors) {
      const origin = event.request.headers.get("origin");
      const allowedOrigins = Array.isArray(options.cors.origin)
        ? options.cors.origin
        : [options.cors.origin || "*"];

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin || "")) {
        setResponseHeader(event, "Access-Control-Allow-Origin", origin || "*");
      }

      if (options.cors.methods) {
        setResponseHeader(event, "Access-Control-Allow-Methods", options.cors.methods.join(", "));
      }

      if (options.cors.allowedHeaders) {
        setResponseHeader(event, "Access-Control-Allow-Headers", options.cors.allowedHeaders.join(", "));
      }

      if (options.cors.credentials) {
        setResponseHeader(event, "Access-Control-Allow-Credentials", "true");
      }

      // Handle preflight requests
      if (event.request.method === "OPTIONS") {
        return new Response(null, {
          status: HTTP_STATUS.NO_CONTENT,
          headers: {
            "Access-Control-Allow-Methods": options.cors.methods?.join(", ") || "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": options.cors.allowedHeaders?.join(", ") || "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        });
      }
    }

    // Rate limiting middleware
    if (options.rateLimit) {
      const clientIp = event.request.headers.get("x-forwarded-for") ||
        event.request.headers.get("x-real-ip") ||
        "unknown";

      // This would need a proper rate limiting implementation
      // For now, just log the request
      if (options.logging?.enabled) {
        console.log(`[${clientIp}] ${event.request.method} ${event.request.url}`);
      }
    }

    // Continue to next middleware or handler
    return next ? await next() : undefined;
  };
}

function setResponseHeader(event: H3Event, name: string, value: string): void {
  if (!event.response.headers) {
    event.response.headers = {};
  }
  event.response.headers[name] = value;
}
