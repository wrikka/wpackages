import { type Graph } from "../data-structures";

export function depthFirstSearch(graph: Graph, startNode: string): string[] {
	if (!graph.has(startNode)) {
		return [];
	}

	const visited = new Set<string>();
	const result: string[] = [];

	const dfsRecursive = (vertex: string) => {
		visited.add(vertex);
		result.push(vertex);

		const neighbors = graph.get(vertex);
		if (neighbors) {
			for (const neighbor of neighbors) {
				if (!visited.has(neighbor)) {
					dfsRecursive(neighbor);
				}
			}
		}
	};

	dfsRecursive(startNode);
	return result;
}
