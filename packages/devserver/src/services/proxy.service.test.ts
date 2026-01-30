import { describe, expect, it } from "vitest";
import { createProxyMiddleware, createProxyMiddlewareList } from "./proxy.service";
import type { ProxyConfig } from "../types/config";

describe("proxy.service", () => {
	describe("createProxyMiddleware", () => {
		it("should create a middleware function", () => {
			const config: ProxyConfig = {
				context: ["/api"],
				target: "http://localhost:8080",
			};

			const middleware = createProxyMiddleware(config);
			expect(typeof middleware).toBe("function");
		});

		it("should proxy requests matching the context", async () => {
			const config: ProxyConfig = {
				context: ["/api"],
				target: "http://localhost:8080",
			};

			const middleware = createProxyMiddleware(config);

			const mockEvent = {
				request: new Request("http://localhost:3000/api/users"),
			} as any;

			const response = await middleware(mockEvent);
			expect(response).toBeDefined();
		});

		it("should not proxy requests not matching the context", async () => {
			const config: ProxyConfig = {
				context: ["/api"],
				target: "http://localhost:8080",
			};

			const middleware = createProxyMiddleware(config);

			const mockEvent = {
				request: new Request("http://localhost:3000/home"),
			} as any;

			const response = await middleware(mockEvent);
			expect(response).toBeUndefined();
		});

		it("should rewrite paths when pathRewrite is configured", async () => {
			const config: ProxyConfig = {
				context: ["/api"],
				target: "http://localhost:8080",
				pathRewrite: {
					"^/api": "",
				},
			};

			const middleware = createProxyMiddleware(config);

			const mockEvent = {
				request: new Request("http://localhost:3000/api/users"),
			} as any;

			const response = await middleware(mockEvent);
			expect(response).toBeDefined();
		});

		it("should handle multiple context patterns", async () => {
			const config: ProxyConfig = {
				context: ["/api", "/auth"],
				target: "http://localhost:8080",
			};

			const middleware = createProxyMiddleware(config);

			const mockEvent1 = {
				request: new Request("http://localhost:3000/api/users"),
			} as any;

			const mockEvent2 = {
				request: new Request("http://localhost:3000/auth/login"),
			} as any;

			const response1 = await middleware(mockEvent1);
			const response2 = await middleware(mockEvent2);

			expect(response1).toBeDefined();
			expect(response2).toBeDefined();
		});
	});

	describe("createProxyMiddlewareList", () => {
		it("should create an array of middlewares", () => {
			const configs: readonly ProxyConfig[] = [
				{
					context: ["/api"],
					target: "http://localhost:8080",
				},
				{
					context: ["/auth"],
					target: "http://localhost:9000",
				},
			];

			const middlewares = createProxyMiddlewareList(configs);
			expect(middlewares).toHaveLength(2);
			expect(middlewares.every((m) => typeof m === "function")).toBe(true);
		});

		it("should handle empty configs array", () => {
			const middlewares = createProxyMiddlewareList([]);
			expect(middlewares).toHaveLength(0);
		});
	});
});
