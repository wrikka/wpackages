/**
 * Usage examples for dependency resolver utilities
 */

import type { Plugin, PluginRegistry } from "../types";
import {
	buildDependencyGraph,
	detectCircularDependencies,
	getLoadOrder,
	resolveDependencies,
} from "./dependency-resolver.utils";

// Helper to create plugin
const createPlugin = (id: string, deps: string[] = []): Plugin => ({
	metadata: {
		id,
		name: `Plugin ${id}`,
		version: "1.0.0",
		author: "Example Author",
		description: `${id} plugin`,
	},
	dependencies: deps.map((depId) => ({ id: depId, version: "1.0.0" })),
	init: async () => {},
});

// Example 1: Build dependency graph
console.log("=== Example 1: Build Dependency Graph ===");
const plugins1 = [
	createPlugin("core"),
	createPlugin("auth", ["core"]),
	createPlugin("api", ["core", "auth"]),
	createPlugin("ui", ["api"]),
];

const graph = buildDependencyGraph(plugins1);
console.log("Dependency Graph:");
console.log(JSON.stringify(graph, null, 2));

// Example 2: Detect circular dependencies
console.log("\n=== Example 2: Detect Circular Dependencies ===");

// Case 1: No circular dependencies
const acyclicPlugins = [
	createPlugin("a"),
	createPlugin("b", ["a"]),
	createPlugin("c", ["b"]),
];

const acyclicGraph = buildDependencyGraph(acyclicPlugins);
const cycles1 = detectCircularDependencies(acyclicGraph);
console.log(
	`Acyclic graph cycles: ${cycles1.length === 0 ? "None" : cycles1.join(", ")}`,
);

// Case 2: Simple circular dependency
const cyclicPlugins = [
	createPlugin("x"),
	createPlugin("y", ["z"]),
	createPlugin("z", ["y"]),
];

const cyclicGraph = buildDependencyGraph(cyclicPlugins);
const cycles2 = detectCircularDependencies(cyclicGraph);
console.log(`Cyclic graph detected: ${cycles2.length > 0 ? "Yes" : "No"}`);
if (cycles2.length > 0) {
	console.log(`Cycles found: ${cycles2.join(" | ")}`);
}

// Example 3: Get load order
console.log("\n=== Example 3: Get Load Order ===");
const unorderedPlugins = [
	createPlugin("ui", ["api"]),
	createPlugin("api", ["auth", "db"]),
	createPlugin("auth", ["core"]),
	createPlugin("db", ["core"]),
	createPlugin("core"),
];

const orderedPlugins = getLoadOrder(unorderedPlugins);
console.log("Load Order:");
orderedPlugins.forEach((plugin, index) => {
	const deps = plugin.dependencies?.map((d) => d.id).join(", ") || "none";
	console.log(`  ${index + 1}. ${plugin.metadata.id} (depends on: ${deps})`);
});

// Example 4: Resolve dependencies with registry
console.log("\n=== Example 4: Resolve Dependencies ===");

// Case 1: All dependencies satisfied
const registry1: PluginRegistry = {
	core: {
		plugin: createPlugin("core"),
		status: "enabled",
		installedAt: new Date(),
		enabledAt: new Date(),
	},
	auth: {
		plugin: createPlugin("auth", ["core"]),
		status: "enabled",
		installedAt: new Date(),
		enabledAt: new Date(),
	},
};

const errors1 = resolveDependencies(
	[createPlugin("api", ["core", "auth"])],
	registry1,
);
console.log(
	`All dependencies satisfied: ${errors1.length === 0 ? "Yes" : "No"}`,
);

// Case 2: Missing dependency
const registry2: PluginRegistry = {
	core: {
		plugin: createPlugin("core"),
		status: "enabled",
		installedAt: new Date(),
		enabledAt: new Date(),
	},
};

const errors2 = resolveDependencies(
	[createPlugin("api", ["core", "auth"])],
	registry2,
);
console.log(`Missing dependencies: ${errors2.length > 0 ? "Yes" : "No"}`);
if (errors2.length > 0) {
	console.log("Errors:");
	errors2.forEach((error) => console.log(`  - ${error}`));
}

// Example 5: Complex dependency tree
console.log("\n=== Example 5: Complex Dependency Tree ===");
const complexPlugins = [
	createPlugin("core"),
	createPlugin("utils", ["core"]),
	createPlugin("logger", ["core"]),
	createPlugin("config", ["core"]),
	createPlugin("auth", ["core", "config"]),
	createPlugin("db", ["core", "config"]),
	createPlugin("cache", ["db"]),
	createPlugin("api", ["auth", "db", "logger"]),
	createPlugin("websocket", ["api"]),
	createPlugin("ui", ["api", "websocket"]),
	createPlugin("admin", ["ui", "auth"]),
];

const complexGraph = buildDependencyGraph(complexPlugins);
const complexCycles = detectCircularDependencies(complexGraph);
const complexOrder = getLoadOrder(complexPlugins);

console.log(`Total plugins: ${complexPlugins.length}`);
console.log(
	`Circular dependencies: ${complexCycles.length === 0 ? "None" : complexCycles.length}`,
);
console.log("\nLoad order (first 5):");
complexOrder.slice(0, 5).forEach((plugin, index) => {
	console.log(`  ${index + 1}. ${plugin.metadata.id}`);
});

// Example 6: Optional dependencies
console.log("\n=== Example 6: Optional Dependencies ===");
const pluginWithOptional: Plugin = {
	metadata: {
		id: "analytics",
		name: "Analytics Plugin",
		version: "1.0.0",
		description: "Analytics plugin with optional dependencies",
		author: "Example",
	},
	dependencies: [
		{ id: "core", version: "1.0.0", optional: false },
		{ id: "premium", version: "1.0.0", optional: true },
	],
	init: async () => {},
};

const registryOptional: PluginRegistry = {
	core: {
		plugin: createPlugin("core"),
		status: "enabled",
		installedAt: new Date(),
		enabledAt: new Date(),
	},
	// premium is not installed, but it's optional
};

const optionalErrors = resolveDependencies(
	[pluginWithOptional],
	registryOptional,
);
console.log(
	`Optional dependency missing: ${optionalErrors.length === 0 ? "OK (optional)" : "Error"}`,
);

// Example 7: Self-dependency detection
console.log("\n=== Example 7: Self-Dependency Detection ===");
const selfDependentGraph = {
	plugin: ["plugin"],
};

const selfCycles = detectCircularDependencies(selfDependentGraph);
console.log(
	`Self-dependency detected: ${selfCycles.length > 0 ? "Yes" : "No"}`,
);

console.log("\n✓ All examples completed");
