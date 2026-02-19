import { describe, expect, it } from "vitest";
import type { Plugin } from "../types";
import {
	buildDependencyGraph,
	detectCircularDependencies,
	getLoadOrder,
	resolveDependencies,
} from "./dependency-resolver.utils";

describe("dependency-resolver.utils", () => {
	const createMockPlugin = (id: string, deps: string[] = []): Plugin => ({
		metadata: {
			id,
			name: `Plugin ${id}`,
			version: "1.0.0",
			author: "Test Author",
			description: "Test plugin",
		},
		dependencies: deps.map((depId) => ({ id: depId, version: "1.0.0" })),
		init: async () => {},
	});

	describe("buildDependencyGraph", () => {
		it("should build dependency graph from plugins", () => {
			const plugins = [
				createMockPlugin("a", ["b"]),
				createMockPlugin("b", ["c"]),
				createMockPlugin("c", []),
			];

			const graph = buildDependencyGraph(plugins);

			expect(graph).toEqual({
				a: ["b"],
				b: ["c"],
				c: [],
			});
		});

		it("should handle plugins without dependencies", () => {
			const plugins = [createMockPlugin("a"), createMockPlugin("b")];

			const graph = buildDependencyGraph(plugins);

			expect(graph).toEqual({
				a: [],
				b: [],
			});
		});

		it("should return frozen object", () => {
			const plugins = [createMockPlugin("a")];
			const graph = buildDependencyGraph(plugins);

			expect(Object.isFrozen(graph)).toBe(true);
		});
	});

	describe("detectCircularDependencies", () => {
		it("should detect direct circular dependency", () => {
			const graph = {
				a: ["b"],
				b: ["a"],
			};

			const cycles = detectCircularDependencies(graph);

			expect(cycles.length).toBeGreaterThan(0);
			expect(cycles[0]).toContain("a");
			expect(cycles[0]).toContain("b");
		});

		it("should detect indirect circular dependency", () => {
			const graph = {
				a: ["b"],
				b: ["c"],
				c: ["a"],
			};

			const cycles = detectCircularDependencies(graph);

			expect(cycles.length).toBeGreaterThan(0);
		});

		it("should return empty array when no cycles exist", () => {
			const graph = {
				a: ["b"],
				b: ["c"],
				c: [],
			};

			const cycles = detectCircularDependencies(graph);

			expect(cycles).toEqual([]);
		});

		it("should return frozen array", () => {
			const graph = { a: ["b"], b: [] };
			const cycles = detectCircularDependencies(graph);

			expect(Object.isFrozen(cycles)).toBe(true);
		});
	});

	describe("resolveDependencies", () => {
		it("should detect missing required dependencies", () => {
			const plugins = [createMockPlugin("a", ["b"])];
			const registry = {};

			const errors = resolveDependencies(plugins, registry);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0]).toContain("not installed");
		});

		it("should ignore optional missing dependencies", () => {
			const plugin: Plugin = {
				metadata: {
					id: "a",
					name: "Plugin A",
					version: "1.0.0",
					author: "Test",
				},
				dependencies: [{ id: "b", version: "1.0.0", optional: true }],
				init: async () => {},
			};

			const errors = resolveDependencies([plugin], {});

			expect(errors).toEqual([]);
		});

		it("should detect dependencies with errors", () => {
			const plugins = [createMockPlugin("a", ["b"])];
			const registry = {
				b: {
					plugin: createMockPlugin("b"),
					status: "error" as const,
					installedAt: new Date(),
				},
			};

			const errors = resolveDependencies(plugins, registry);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0]).toContain("has errors");
		});

		it("should return frozen array", () => {
			const plugins = [createMockPlugin("a")];
			const errors = resolveDependencies(plugins, {});

			expect(Object.isFrozen(errors)).toBe(true);
		});
	});

	describe("getLoadOrder", () => {
		it("should order plugins by dependencies", () => {
			const plugins = [
				createMockPlugin("a", ["b", "c"]),
				createMockPlugin("b", ["c"]),
				createMockPlugin("c", []),
			];

			const ordered = getLoadOrder(plugins);

			const indexOf = (id: string) => ordered.findIndex((p) => p.metadata.id === id);

			expect(indexOf("c")).toBeLessThan(indexOf("b"));
			expect(indexOf("b")).toBeLessThan(indexOf("a"));
		});

		it("should handle plugins without dependencies", () => {
			const plugins = [createMockPlugin("a"), createMockPlugin("b")];

			const ordered = getLoadOrder(plugins);

			expect(ordered).toHaveLength(2);
		});

		it("should return frozen array", () => {
			const plugins = [createMockPlugin("a")];
			const ordered = getLoadOrder(plugins);

			expect(Object.isFrozen(ordered)).toBe(true);
		});

		it("should handle complex dependency tree", () => {
			const plugins = [
				createMockPlugin("a", ["b", "d"]),
				createMockPlugin("b", ["c"]),
				createMockPlugin("c", []),
				createMockPlugin("d", ["c"]),
			];

			const ordered = getLoadOrder(plugins);

			const indexOf = (id: string) => ordered.findIndex((p) => p.metadata.id === id);

			expect(indexOf("c")).toBeLessThan(indexOf("b"));
			expect(indexOf("c")).toBeLessThan(indexOf("d"));
			expect(indexOf("b")).toBeLessThan(indexOf("a"));
			expect(indexOf("d")).toBeLessThan(indexOf("a"));
		});
	});
});
