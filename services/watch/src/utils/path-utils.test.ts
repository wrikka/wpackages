import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	getPathDepth,
	getRelativePath,
	isAbsolutePath,
	isSubPath,
	joinPaths,
	normalizePath,
	resolvePath,
} from "./path-utils";

describe("path-utils", () => {
	it("normalizePath should normalize a path", () => {
		expect(normalizePath("foo\\bar//baz")).toBe("foo/bar/baz");
	});

	it("resolvePath should resolve a path", () => {
		const expected = resolve("foo/bar").replace(/\\/g, "/");
		expect(resolvePath("foo/bar")).toBe(expected);
	});

	it("getRelativePath should return the relative path", () => {
		expect(getRelativePath("/foo/bar", "/foo/bar/baz")).toBe("baz");
		expect(getRelativePath("/foo/bar", "/foo/baz")).toBe("../baz");
	});

	it("isAbsolutePath should check if a path is absolute", () => {
		expect(isAbsolutePath("/foo/bar")).toBe(true);
		expect(isAbsolutePath("foo/bar")).toBe(false);
	});

	it("joinPaths should join paths", () => {
		expect(joinPaths("foo", "bar", "baz")).toBe("foo/bar/baz");
	});

	it("getPathDepth should return the depth of a path", () => {
		expect(getPathDepth("/foo/bar/baz")).toBe(3);
		expect(getPathDepth("foo/bar")).toBe(2);
		expect(getPathDepth("/")).toBe(0);
	});

	it("isSubPath should check if a path is a sub-path", () => {
		expect(isSubPath("/foo/bar", "/foo/bar/baz")).toBe(true);
		expect(isSubPath("/foo/bar", "/foo/baz")).toBe(false);
		expect(isSubPath("/foo/bar", "/foo/bar")).toBe(false);
	});
});
