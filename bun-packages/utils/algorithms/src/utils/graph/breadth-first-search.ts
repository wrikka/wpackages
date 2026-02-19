import type { AdjacencyListGraph } from "./types";

export function breadthFirstSearch(graph: AdjacencyListGraph, startNode: string, targetNode: string): string[] | null {
	const visited = new Set<string>();
	const queue: string[] = [startNode];
	const parent: Record<string, string | null> = { [startNode]: null };

	visited.add(startNode);

	while (queue.length > 0) {
		const currentNode = queue.shift()!;

		if (currentNode === targetNode) {
			const path: string[] = [];
			let node = currentNode;
			while (node !== null) {
				path.unshift(node);
				node = parent[node]!;
			}
			return path;
		}

		for (const neighbor of graph[currentNode] || []) {
			if (!visited.has(neighbor)) {
				visited.add(neighbor);
				parent[neighbor] = currentNode;
				queue.push(neighbor);
			}
		}
	}

	return null;
}
