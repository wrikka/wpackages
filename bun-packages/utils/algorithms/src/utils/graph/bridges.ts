import type { AdjacencyListGraph } from "./types";

export function findBridges(graph: AdjacencyListGraph): [string, string][] {
	const vertices = Object.keys(graph);
	const bridges: [string, string][] = [];
	const discovery = new Map<string, number>();
	const low = new Map<string, number>();
	const parent = new Map<string, string | null>();
	let time = 0;

	function dfs(node: string): void {
		discovery.set(node, time);
		low.set(node, time);
		time++;

		for (const neighbor of graph[node] || []) {
			if (!discovery.has(neighbor)) {
				parent.set(neighbor, node);
				dfs(neighbor);

				low.set(node, Math.min(low.get(node)!, low.get(neighbor)!));

				if (low.get(neighbor)! > discovery.get(node)!) {
					bridges.push([node, neighbor]);
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

	return bridges;
}
