import { describe, it, expect } from "bun:test";
import { createMiddleware } from "../src/lib/middleware";

describe("middleware", () => {
  describe("createMiddleware", () => {
    it("should create middleware function", () => {
      const middleware = createMiddleware();
      expect(typeof middleware).toBe("function");
    });

    it("should handle CORS headers", async () => {
      const middleware = createMiddleware({
        cors: {
          origin: ["http://localhost:3000"],
          methods: ["GET", "POST"],
          credentials: true,
        }
      });

      const mockEvent = {
        request: new Request("http://localhost:3000/api", {
          method: "GET",
          headers: { origin: "http://localhost:3000" }
        }),
        response: { headers: {} },
        context: {},
      };

      const result = await middleware(mockEvent);

      expect(result).toBeUndefined();
      expect(mockEvent.response.headers).toEqual({
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Credentials": "true",
      });
    });

    it("should handle preflight OPTIONS request", async () => {
      const middleware = createMiddleware({
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        }
      });

      const mockEvent = {
        request: new Request("http://localhost:3000/api", {
          method: "OPTIONS",
          headers: { origin: "http://localhost:3000" }
        }),
        response: { headers: {} },
        context: {},
      };

      const result = await middleware(mockEvent);

      expect(result).toBeDefined();
      expect(result?.status).toBe(204);
    });
  });

  describe("rate limiting", () => {
    it("should log requests when rate limiting is enabled", async () => {
      const middleware = createMiddleware({
        rateLimit: {
          windowMs: 60000,
          max: 10,
        },
        logging: {
          enabled: true,
          level: "info",
        }
      });

      const mockEvent = {
        request: new Request("http://localhost:3000/api", {
          method: "GET",
          headers: { "x-forwarded-for": "192.168.1.1" }
        }),
        response: { headers: {} },
        context: {},
      };

      // Just test that middleware runs without error
      const result = await middleware(mockEvent);
      expect(result).toBeUndefined();
    });
  });
});
