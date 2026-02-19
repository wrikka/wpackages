import { describe, expect, it } from "vitest";
import { HTTP_HEADERS } from "../constant";
import type { AuthConfig } from "../types";
import { buildAuthHeader, buildDefaultHeaders, extractRateLimitInfo, mergeHeaders, normalizeHeaders } from "./headers";

describe("headers utils", () => {
	describe("buildAuthHeader", () => {
		it("should build API key header", () => {
			const auth: AuthConfig = {
				key: "test-key",
				location: "header",
				name: "X-API-Key",
				type: "api_key",
			};
			const result = buildAuthHeader(auth);
			expect(result).toEqual({ "X-API-Key": "test-key" });
		});

		it("should build bearer token header", () => {
			const auth: AuthConfig = {
				token: "test-token",
				type: "bearer",
			};
			const result = buildAuthHeader(auth);
			expect(result).toEqual({ Authorization: "Bearer test-token" });
		});

		it("should build basic auth header", () => {
			const auth: AuthConfig = {
				password: "pass",
				type: "basic",
				username: "user",
			};
			const result = buildAuthHeader(auth);
			expect(result[HTTP_HEADERS.AUTHORIZATION]).toContain("Basic ");
		});

		it("should build OAuth2 header", () => {
			const auth: AuthConfig = {
				accessToken: "access-token",
				clientId: "client",
				clientSecret: "secret",
				type: "oauth2",
			};
			const result = buildAuthHeader(auth);
			expect(result).toEqual({ Authorization: "Bearer access-token" });
		});

		it("should build custom auth headers", () => {
			const auth: AuthConfig = {
				headers: { "X-Custom": "value" },
				type: "custom",
			};
			const result = buildAuthHeader(auth);
			expect(result).toEqual({ "X-Custom": "value" });
		});
	});

	describe("mergeHeaders", () => {
		it("should merge multiple header objects", () => {
			const result = mergeHeaders(
				{ "Content-Type": "application/json" },
				{ Authorization: "Bearer token" },
				{ "X-Custom": "value" },
			);
			expect(result).toEqual({
				Authorization: "Bearer token",
				"Content-Type": "application/json",
				"X-Custom": "value",
			});
		});

		it("should override earlier values with later ones", () => {
			const result = mergeHeaders(
				{ "Content-Type": "text/plain" },
				{ "Content-Type": "application/json" },
			);
			expect(result["Content-Type"]).toBe("application/json");
		});

		it("should handle undefined headers", () => {
			const result = mergeHeaders(
				{ "Content-Type": "application/json" },
				undefined,
				{ Authorization: "Bearer token" },
			);
			expect(result).toEqual({
				Authorization: "Bearer token",
				"Content-Type": "application/json",
			});
		});
	});

	describe("buildDefaultHeaders", () => {
		it("should return default headers", () => {
			const headers = buildDefaultHeaders();
			expect(headers).toHaveProperty("Content-Type");
			expect(headers).toHaveProperty("Accept");
			expect(headers).toHaveProperty("User-Agent");
		});
	});

	describe("normalizeHeaders", () => {
		it("should normalize header names to lowercase", () => {
			const result = normalizeHeaders({
				"Content-Type": "application/json",
				"X-API-Key": "test",
			});
			expect(result).toEqual({
				"content-type": "application/json",
				"x-api-key": "test",
			});
		});
	});

	describe("extractRateLimitInfo", () => {
		it("should extract rate limit info from headers", () => {
			const headers = {
				"retry-after": "60",
				"x-ratelimit-limit": "100",
				"x-ratelimit-remaining": "50",
				"x-ratelimit-reset": "1234567890",
			};
			const result = extractRateLimitInfo(headers);
			expect(result).toEqual({
				limit: 100,
				remaining: 50,
				resetAt: 1234567890,
				retryAfter: 60,
			});
		});

		it("should handle missing headers", () => {
			const result = extractRateLimitInfo({});
			expect(result).toEqual({
				limit: undefined,
				remaining: undefined,
				resetAt: undefined,
				retryAfter: undefined,
			});
		});
	});
});
