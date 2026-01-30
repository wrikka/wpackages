import type { AdjacencyListGraph } from "./types";

export function findArticulationPoints(graph: AdjacencyListGraph): string[] {
	const vertices = Object.keys(graph);
	const articulationPoints = new Set<string>();
	const discovery = new Map<string, number>();
	const low = new Map<string, number>();
	const parent = new Map<string, string | null>();
	let time = 0;

	function dfs(node: string): void {
		discovery.set(node, time);
		low.set(node, time);
		time++;
		let children = 0;

		for (const neighbor of graph[node] || []) {
			if (!discovery.has(neighbor)) {
				parent.set(neighbor, node);
				children++;
				dfs(neighbor);

				low.set(node, Math.min(low.get(node)!, low.get(neighbor)!));

				if (parent.get(node) === null && children > 1) {
					articulationPoints.add(node);
				}
				if (parent.get(node) !== null && low.get(neighbor)! >= discovery.get(node)!) {
					articulationPoints.add(node);
				}
			} else if (neighbor !== parent.get(node)) {
				low.set(node, Math.min(low.get(node)!, discovery.get(neighbor)!));
			}
		}
	}

	for (const vertex of vertices) {
		if (!discovery.has(vertex)) {
			parent.set(vertex, null);
			dfs(vertex);
		}
	}

	return Array.from(articulationPoints);
}
