import { describe, expect, it } from "vitest";
import { parseRouteParams, pathToRegex, extractParams, matchRoute } from "../utils";
import type { WRouteRecord } from "../types";

describe("parseRouteParams", () => {
	it("parses dynamic params [id]", () => {
		const params = parseRouteParams("/users/[id]");
		expect(params).toEqual([{ name: "id", type: "string", optional: false }]);
	});

	it("parses optional params [[id]]", () => {
		const params = parseRouteParams("/users/[[id]]");
		expect(params).toEqual([{ name: "id", type: "string", optional: true }]);
	});

	it("parses wildcard params [...slug]", () => {
		const params = parseRouteParams("/posts/[...slug]");
		expect(params).toEqual([{ name: "slug", type: "string", optional: false }]);
	});

	it("parses colon params :id", () => {
		const params = parseRouteParams("/users/:id");
		expect(params).toEqual([{ name: "id", type: "string", optional: false }]);
	});

	it("parses multiple params", () => {
		const params = parseRouteParams("/users/[id]/posts/[postId]");
		expect(params).toEqual([
			{ name: "id", type: "string", optional: false },
			{ name: "postId", type: "string", optional: false },
		]);
	});

	it("returns empty array for static routes", () => {
		const params = parseRouteParams("/users");
		expect(params).toEqual([]);
	});
});

describe("pathToRegex", () => {
	it("converts [id] to regex", () => {
		const regex = pathToRegex("/users/[id]");
		expect(regex.test("/users/123")).toBe(true);
		expect(regex.test("/users/abc")).toBe(true);
		expect(regex.test("/users")).toBe(false);
	});

	it("converts [[id]] to optional regex", () => {
		const regex = pathToRegex("/users/[[id]]");
		expect(regex.test("/users/123")).toBe(true);
		expect(regex.test("/users")).toBe(true);
	});

	it("converts [...slug] to wildcard regex", () => {
		const regex = pathToRegex("/posts/[...slug]");
		expect(regex.test("/posts/a/b/c")).toBe(true);
		expect(regex.test("/posts")).toBe(false);
	});

	it("converts :id to regex", () => {
		const regex = pathToRegex("/users/:id");
		expect(regex.test("/users/123")).toBe(true);
	});
});

describe("extractParams", () => {
	it("extracts params from matched path", () => {
		const regex = pathToRegex("/users/[id]");
		const params = extractParams("/users/123", regex);
		expect(params).toEqual({ id: "123" });
	});

	it("extracts multiple params", () => {
		const regex = pathToRegex("/users/[id]/posts/[postId]");
		const params = extractParams("/users/1/posts/2", regex);
		expect(params).toEqual({ id: "1", postId: "2" });
	});

	it("returns empty object for no params", () => {
		const regex = pathToRegex("/users");
		const params = extractParams("/users", regex);
		expect(params).toEqual({});
	});
});

describe("matchRoute", () => {
	it("matches static routes", () => {
		const routes: WRouteRecord[] = [
			{ path: "/", file: "/index.ts", name: "index", params: [], methods: ["GET"] },
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const match = matchRoute("/users", routes);
		expect(match?.route.path).toBe("/users");
	});

	it("matches dynamic routes", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users/[id]", file: "/users/[id].ts", name: "users-id", params: [{ name: "id", type: "string", optional: false }], methods: ["GET"] },
		];

		const match = matchRoute("/users/123", routes);
		expect(match?.route.path).toBe("/users/[id]");
		expect(match?.params).toEqual({ id: "123" });
	});

	it("returns null for unmatched routes", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const match = matchRoute("/posts", routes);
		expect(match).toBeNull();
	});

	it("extracts query params", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const match = matchRoute("/users?foo=bar", routes);
		expect(match?.query).toEqual({ foo: "bar" });
	});

	it("extracts hash", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const match = matchRoute("/users#section", routes);
		expect(match?.hash).toBe("#section");
	});
});
