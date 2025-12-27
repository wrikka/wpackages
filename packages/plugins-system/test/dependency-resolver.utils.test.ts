/**
 * Dependency Resolver Utils Tests
 */

import { describe, expect, it } from "vitest";
import type { Plugin } from "../src/types";
import { buildDependencyGraph, detectCircularDependencies, getLoadOrder } from "../src/utils";

describe("Dependency Resolver Utils", () => {
	const createPlugin = (id: string, deps: string[] = []): Plugin => ({
		metadata: {
			id,
			name: `Plugin ${id}`,
			version: "1.0.0",
			description: "Test plugin",
			author: "Test",
		},
		dependencies: deps.map((depId) => ({ id: depId, version: "1.0.0" })),
		init: async () => {},
	});

	describe("buildDependencyGraph", () => {
		it("should build a dependency graph from plugins", () => {
			const plugins = [
				createPlugin("a"),
				createPlugin("b", ["a"]),
				createPlugin("c", ["b"]),
			];

			const graph = buildDependencyGraph(plugins);

			expect(graph).toEqual({
				a: [],
				b: ["a"],
				c: ["b"],
			});
		});

		it("should handle plugins with multiple dependencies", () => {
			const plugins = [
				createPlugin("a"),
				createPlugin("b"),
				createPlugin("c", ["a", "b"]),
			];

			const graph = buildDependencyGraph(plugins);

			expect(graph).toEqual({
				a: [],
				b: [],
				c: ["a", "b"],
			});
		});

		it("should handle empty plugin list", () => {
			const graph = buildDependencyGraph([]);
			expect(graph).toEqual({});
		});
	});

	describe("detectCircularDependencies", () => {
		it("should detect simple circular dependency", () => {
			const graph = {
				a: ["b"],
				b: ["a"],
			};

			const cycles = detectCircularDependencies(graph);

			expect(cycles.length).toBeGreaterThan(0);
			expect(cycles[0]).toContain("a");
			expect(cycles[0]).toContain("b");
		});

		it("should detect complex circular dependency", () => {
			const graph = {
				a: ["b"],
				b: ["c"],
				c: ["a"],
			};

			const cycles = detectCircularDependencies(graph);

			expect(cycles.length).toBeGreaterThan(0);
		});

		it("should return empty array for acyclic graph", () => {
			const graph = {
				a: [],
				b: ["a"],
				c: ["b"],
			};

			const cycles = detectCircularDependencies(graph);

			expect(cycles).toEqual([]);
		});

		it("should handle self-dependency", () => {
			const graph = {
				a: ["a"],
			};

			const cycles = detectCircularDependencies(graph);

			expect(cycles.length).toBeGreaterThan(0);
		});

		it("should handle empty graph", () => {
			const cycles = detectCircularDependencies({});
			expect(cycles).toEqual([]);
		});
	});

	describe("getLoadOrder", () => {
		it("should return correct load order", () => {
			const pluginA = createPlugin("a");
			const pluginB = createPlugin("b", ["a"]);
			const pluginC = createPlugin("c", ["b"]);

			const plugins = [pluginC, pluginB, pluginA];
			const ordered = getLoadOrder(plugins);

			const ids = ordered.map((p) => p.metadata.id);

			expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("b"));
			expect(ids.indexOf("b")).toBeLessThan(ids.indexOf("c"));
		});

		it("should handle plugins with multiple dependencies", () => {
			const pluginA = createPlugin("a");
			const pluginB = createPlugin("b");
			const pluginC = createPlugin("c", ["a", "b"]);

			const plugins = [pluginC, pluginB, pluginA];
			const ordered = getLoadOrder(plugins);

			const ids = ordered.map((p) => p.metadata.id);

			expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("c"));
			expect(ids.indexOf("b")).toBeLessThan(ids.indexOf("c"));
		});

		it("should handle independent plugins", () => {
			const plugins = [createPlugin("a"), createPlugin("b"), createPlugin("c")];

			const ordered = getLoadOrder(plugins);

			expect(ordered).toHaveLength(3);
			expect(ordered.map((p) => p.metadata.id)).toContain("a");
			expect(ordered.map((p) => p.metadata.id)).toContain("b");
			expect(ordered.map((p) => p.metadata.id)).toContain("c");
		});

		it("should handle complex dependency tree", () => {
			const pluginBase = createPlugin("base");
			const pluginAuth = createPlugin("auth", ["base"]);
			const pluginData = createPlugin("data", ["base"]);
			const pluginUser = createPlugin("user", ["auth", "data"]);
			const pluginAdmin = createPlugin("admin", ["user"]);

			const plugins = [
				pluginAdmin,
				pluginUser,
				pluginData,
				pluginAuth,
				pluginBase,
			];
			const ordered = getLoadOrder(plugins);

			const ids = ordered.map((p) => p.metadata.id);

			// Base should be first
			expect(ids.indexOf("base")).toBe(0);

			// Auth and Data should come after Base but before User
			expect(ids.indexOf("auth")).toBeLessThan(ids.indexOf("user"));
			expect(ids.indexOf("data")).toBeLessThan(ids.indexOf("user"));

			// User should come before Admin
			expect(ids.indexOf("user")).toBeLessThan(ids.indexOf("admin"));
		});

		it("should handle empty array", () => {
			const ordered = getLoadOrder([]);
			expect(ordered).toEqual([]);
		});

		it("should preserve all plugins", () => {
			const plugins = [
				createPlugin("a"),
				createPlugin("b", ["a"]),
				createPlugin("c"),
			];

			const ordered = getLoadOrder(plugins);

			expect(ordered).toHaveLength(3);
			expect(ordered.map((p) => p.metadata.id).sort()).toEqual(["a", "b", "c"]);
		});
	});
});
