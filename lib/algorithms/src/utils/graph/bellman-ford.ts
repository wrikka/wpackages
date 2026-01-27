import { type WeightedGraph } from "../data-structures";

export interface BellmanFordResult {
	distances: Record<string, number>;
	previous: Record<string, string | null>;
	hasNegativeCycle: boolean;
}

export function bellmanFord(
	graph: WeightedGraph,
	startNode: string,
): BellmanFordResult {
	const distances: Record<string, number> = {};
	const previous: Record<string, string | null> = {};
	const vertices: string[] = Array.from(graph.keys());
	const edges: { u: string; v: string; weight: number }[] = [];

	for (const [u, neighbors] of graph.entries()) {
		for (const neighbor of neighbors) {
			// For directed graphs, you might only add one direction
			edges.push({ u, v: neighbor.node, weight: neighbor.weight });
		}
	}

	// Step 1: Initialize distances
	for (const vertex of vertices) {
		distances[vertex] = Infinity;
		previous[vertex] = null;
	}
	distances[startNode] = 0;

	// Step 2: Relax edges repeatedly
	for (let i = 0; i < vertices.length - 1; i++) {
		for (const { u, v, weight } of edges) {
			const distU = distances[u];
			const distV = distances[v];
			if (distU !== undefined && distV !== undefined && distU + weight < distV) {
				distances[v] = distU + weight;
				previous[v] = u;
			}
		}
	}

	// Step 3: Check for negative-weight cycles
	for (const { u, v, weight } of edges) {
		const distU = distances[u];
		const distV = distances[v];
		if (distU !== undefined && distV !== undefined && distU + weight < distV) {
			return { distances, previous, hasNegativeCycle: true };
		}
	}

	return { distances, previous, hasNegativeCycle: false };
}
