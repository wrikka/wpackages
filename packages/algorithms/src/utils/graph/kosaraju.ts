import type { AdjacencyListGraph } from "./types";

export function kosaraju(graph: AdjacencyListGraph): string[][] {
	const vertices = Object.keys(graph);
	const visited = new Set<string>();
	const stack: string[] = [];

	function dfs(node: string): void {
		visited.add(node);
		for (const neighbor of graph[node] || []) {
			if (!visited.has(neighbor)) {
				dfs(neighbor);
			}
		}
		stack.push(node);
	}

	for (const vertex of vertices) {
		if (!visited.has(vertex)) {
			dfs(vertex);
		}
	}

	const reversedGraph: AdjacencyListGraph = {};
	for (const vertex of vertices) {
		reversedGraph[vertex] = [];
	}
	for (const vertex of vertices) {
		for (const neighbor of graph[vertex] || []) {
			reversedGraph[neighbor]!.push(vertex);
		}
	}

	visited.clear();
	const sccs: string[][] = [];

	function dfsReverse(node: string, component: string[]): void {
		visited.add(node);
		component.push(node);
		for (const neighbor of reversedGraph[node] || []) {
			if (!visited.has(neighbor)) {
				dfsReverse(neighbor, component);
			}
		}
	}

	while (stack.length > 0) {
		const vertex = stack.pop()!;
		if (!visited.has(vertex)) {
			const component: string[] = [];
			dfsReverse(vertex, component);
			sccs.push(component);
		}
	}

	return sccs;
}
