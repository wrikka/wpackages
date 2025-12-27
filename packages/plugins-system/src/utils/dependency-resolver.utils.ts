import type { Plugin, PluginRegistry } from "../types";

export interface DependencyGraph {
	readonly [pluginId: string]: readonly string[];
}

export const buildDependencyGraph = (
	plugins: readonly Plugin[],
): DependencyGraph => {
	const graph: Record<string, string[]> = {};

	for (const plugin of plugins) {
		const deps = plugin.dependencies?.map((d) => d.id) ?? [];
		graph[plugin.metadata.id] = deps;
	}

	return Object.freeze(graph);
};

export const detectCircularDependencies = (
	graph: DependencyGraph,
): readonly string[] => {
	const cycles: string[] = [];
	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	const dfs = (node: string, path: string[]): void => {
		visited.add(node);
		recursionStack.add(node);

		for (const neighbor of graph[node] ?? []) {
			if (!visited.has(neighbor)) {
				dfs(neighbor, [...path, node]);
			} else if (recursionStack.has(neighbor)) {
				cycles.push([...path, node, neighbor].join(" -> "));
			}
		}

		recursionStack.delete(node);
	};

	for (const node of Object.keys(graph)) {
		if (!visited.has(node)) {
			dfs(node, []);
		}
	}

	return Object.freeze(cycles);
};

export const resolveDependencies = (
	plugins: readonly Plugin[],
	registry: PluginRegistry,
): readonly string[] => {
	const errors: string[] = [];

	for (const plugin of plugins) {
		if (!plugin.dependencies) continue;

		for (const dep of plugin.dependencies) {
			const depState = registry[dep.id];

			if (!depState && !dep.optional) {
				errors.push(
					`Plugin ${plugin.metadata.id} requires ${dep.id} which is not installed`,
				);
			}

			if (depState && depState.status === "error") {
				errors.push(
					`Plugin ${plugin.metadata.id} depends on ${dep.id} which has errors`,
				);
			}
		}
	}

	return Object.freeze(errors);
};

export const getLoadOrder = (plugins: readonly Plugin[]): readonly Plugin[] => {
	const graph = buildDependencyGraph(plugins);
	const visited = new Set<string>();
	const result: Plugin[] = [];

	const dfs = (pluginId: string): void => {
		if (visited.has(pluginId)) return;

		visited.add(pluginId);

		const deps = graph[pluginId] ?? [];
		for (const depId of deps) {
			dfs(depId);
		}

		const plugin = plugins.find((p) => p.metadata.id === pluginId);
		if (plugin) {
			result.push(plugin);
		}
	};

	for (const plugin of plugins) {
		dfs(plugin.metadata.id);
	}

	return Object.freeze(result);
};
