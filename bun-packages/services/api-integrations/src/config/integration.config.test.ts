import { describe, expect, it } from "vitest";
import { type BaseIntegrationConfig, buildIntegrationConfig, buildPaginationConfig } from "./integration.config";

describe("Integration Config", () => {
	describe("buildIntegrationConfig", () => {
		it("should build config with all defaults", () => {
			const config: BaseIntegrationConfig = {
				baseUrl: "https://api.example.com",
			};

			const result = buildIntegrationConfig(config);

			expect(result.baseUrl).toBe("https://api.example.com");
			expect(result.timeout).toBe(30000);
			expect(result.debug).toBe(false);
			expect(result.headers).toEqual({});
			expect(result.userAgent).toBe("integration-core");
		});

		it("should override defaults with provided values", () => {
			const config: BaseIntegrationConfig = {
				baseUrl: "https://api.example.com",
				timeout: 5000,
				debug: true,
				headers: { "X-Custom": "value" },
				userAgent: "custom-agent",
			};

			const result = buildIntegrationConfig(config);

			expect(result.timeout).toBe(5000);
			expect(result.debug).toBe(true);
			expect(result.headers).toEqual({ "X-Custom": "value" });
			expect(result.userAgent).toBe("custom-agent");
		});

		it("should merge retry config with defaults", () => {
			const config: BaseIntegrationConfig = {
				baseUrl: "https://api.example.com",
				retry: {
					maxAttempts: 5,
				},
			};

			const result = buildIntegrationConfig(config);

			expect(result.retry.maxAttempts).toBe(5);
			expect(result.retry.initialDelay).toBeDefined();
		});

		it("should merge rate limit config with defaults", () => {
			const config: BaseIntegrationConfig = {
				baseUrl: "https://api.example.com",
				rateLimit: {
					maxRequests: 200,
				},
			};

			const result = buildIntegrationConfig(config);

			expect(result.rateLimit.maxRequests).toBe(200);
		});
	});

	describe("buildPaginationConfig", () => {
		describe("offset pagination", () => {
			it("should build offset config with defaults", () => {
				const config = buildPaginationConfig("offset");

				expect(config.type).toBe("offset");
				expect(config).toHaveProperty("offset");
				expect(config).toHaveProperty("limit");
				const offsetConfig = config as typeof config & { type: "offset" };
				expect(offsetConfig.offset).toBe(0);
				expect(offsetConfig.limit).toBeGreaterThan(0);
			});

			it("should build offset config with custom values", () => {
				const config = buildPaginationConfig("offset", {
					offset: 20,
					limit: 50,
				});

				const offsetConfig = config as typeof config & { type: "offset" };
				expect(offsetConfig.offset).toBe(20);
				expect(offsetConfig.limit).toBe(50);
			});
		});

		describe("cursor pagination", () => {
			it("should build cursor config without cursor", () => {
				const config = buildPaginationConfig("cursor");

				expect(config.type).toBe("cursor");
				expect(config).toHaveProperty("limit");
				const cursorConfig = config as typeof config & { type: "cursor" };
				expect(cursorConfig.cursor).toBeUndefined();
			});

			it("should build cursor config with cursor", () => {
				const config = buildPaginationConfig("cursor", {
					cursor: "abc123",
					limit: 25,
				});

				const cursorConfig = config as typeof config & { type: "cursor" };
				expect(cursorConfig.cursor).toBe("abc123");
				expect(cursorConfig.limit).toBe(25);
			});
		});

		describe("page pagination", () => {
			it("should build page config with defaults", () => {
				const config = buildPaginationConfig("page");

				expect(config.type).toBe("page");
				const pageConfig = config as typeof config & { type: "page" };
				expect(pageConfig.page).toBe(1);
				expect(pageConfig.perPage).toBeGreaterThan(0);
			});

			it("should build page config with custom values", () => {
				const config = buildPaginationConfig("page", {
					page: 3,
					perPage: 100,
				});

				const pageConfig = config as typeof config & { type: "page" };
				expect(pageConfig.page).toBe(3);
				expect(pageConfig.perPage).toBe(100);
			});
		});

		it("should throw error for unknown pagination type", () => {
			expect(() => {
				buildPaginationConfig("invalid" as any);
			}).toThrow("Unknown pagination type");
		});
	});
});
