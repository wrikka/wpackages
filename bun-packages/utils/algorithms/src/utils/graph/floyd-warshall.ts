import { type WeightedGraph } from "../data-structures";

export interface FloydWarshallResult {
	dist: Record<string, Record<string, number>>;
	next: Record<string, Record<string, string | null>>;
}

export function floydWarshall(
	graph: WeightedGraph<string>,
): FloydWarshallResult {
	const dist: Record<string, Record<string, number>> = {};
	const next: Record<string, Record<string, string | null>> = {};
	const vertices: string[] = Array.from(graph.keys());

	// Initialize dist and next matrices
	for (const u of vertices) {
		dist[u] = {};
		next[u] = {};
		for (const v of vertices) {
			if (u === v) {
				dist[u]![v] = 0;
				next[u]![v] = v;
			} else {
				dist[u]![v] = Infinity;
				next[u]![v] = null;
			}
		}
	}

	for (const [u, neighbors] of graph.entries()) {
		for (const { node: v, weight } of neighbors) {
			if (dist[u] !== undefined) {
				dist[u]![v] = weight;
				next[u]![v] = v;
			}
		}
	}

	// Main algorithm
	for (const k of vertices) {
		for (const i of vertices) {
			for (const j of vertices) {
				const distIK = dist[i]?.[k];
				const distKJ = dist[k]?.[j];
				const distIJ = dist[i]?.[j];

				if (distIK !== undefined && distKJ !== undefined && distIJ !== undefined && distIK + distKJ < distIJ) {
					dist[i]![j] = distIK + distKJ;
					next[i]![j] = next[i]?.[k] ?? null;
				}
			}
		}
	}

	return { dist, next };
}
