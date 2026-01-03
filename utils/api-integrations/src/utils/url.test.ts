import { describe, expect, it } from "vitest";
import { buildPathWithParams, buildQueryString, buildUrl, isValidUrl, joinPaths, parseQueryString } from "./url";

describe("url utils", () => {
	describe("buildUrl", () => {
		it("should build URL without query params", () => {
			expect(buildUrl("https://api.example.com", "/users")).toBe(
				"https://api.example.com/users",
			);
		});

		it("should build URL with query params", () => {
			const result = buildUrl("https://api.example.com", "/users", {
				limit: 50,
				page: 1,
			});
			expect(result).toContain("https://api.example.com/users?");
			expect(result).toContain("page=1");
			expect(result).toContain("limit=50");
		});

		it("should handle trailing slash in baseUrl", () => {
			expect(buildUrl("https://api.example.com/", "/users")).toBe(
				"https://api.example.com/users",
			);
		});

		it("should handle leading slash in path", () => {
			expect(buildUrl("https://api.example.com", "users")).toBe(
				"https://api.example.com/users",
			);
		});
	});

	describe("buildQueryString", () => {
		it("should build query string from object", () => {
			const result = buildQueryString({ active: true, limit: 50, page: 1 });
			expect(result).toContain("page=1");
			expect(result).toContain("limit=50");
			expect(result).toContain("active=true");
		});

		it("should encode special characters", () => {
			const result = buildQueryString({ query: "hello world" });
			expect(result).toBe("query=hello%20world");
		});

		it("should filter out undefined and null values", () => {
			const result = buildQueryString({ invalid: null as any, page: 1 });
			expect(result).toBe("page=1");
		});
	});

	describe("parseQueryString", () => {
		it("should parse query string to object", () => {
			const result = parseQueryString("page=1&limit=50");
			expect(result).toEqual({ limit: "50", page: "1" });
		});

		it("should handle leading question mark", () => {
			const result = parseQueryString("?page=1&limit=50");
			expect(result).toEqual({ limit: "50", page: "1" });
		});

		it("should decode special characters", () => {
			const result = parseQueryString("query=hello%20world");
			expect(result).toEqual({ query: "hello world" });
		});

		it("should return empty object for empty string", () => {
			expect(parseQueryString("")).toEqual({});
		});
	});

	describe("buildPathWithParams", () => {
		it("should replace path parameters", () => {
			const result = buildPathWithParams("/users/:id/posts/:postId", {
				id: "123",
				postId: "456",
			});
			expect(result).toBe("/users/123/posts/456");
		});

		it("should handle numeric parameters", () => {
			const result = buildPathWithParams("/users/:id", { id: 123 });
			expect(result).toBe("/users/123");
		});
	});

	describe("joinPaths", () => {
		it("should join paths correctly", () => {
			expect(joinPaths("api", "v1", "users")).toBe("api/v1/users");
		});

		it("should handle leading and trailing slashes", () => {
			const result = joinPaths("/api/", "/v1/", "/users/");
			expect(result).toBe("api/v1/users");
		});

		it("should filter out empty strings", () => {
			expect(joinPaths("api", "", "users")).toBe("api/users");
		});
	});

	describe("isValidUrl", () => {
		it("should return true for valid URLs", () => {
			expect(isValidUrl("https://example.com")).toBe(true);
			expect(isValidUrl("http://localhost:3000")).toBe(true);
		});

		it("should return false for invalid URLs", () => {
			expect(isValidUrl("not a url")).toBe(false);
			expect(isValidUrl("example.com")).toBe(false);
		});
	});
});
