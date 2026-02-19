import { type Graph } from "../data-structures";

export function topologicalSort<T>(graph: Graph<T>): T[] | null {
	const vertices: T[] = Array.from(graph.keys());
	const visited = new Set<T>();
	const recursionStack = new Set<T>();
	const sorted: T[] = [];

	// The DFS utility function
	const dfs = (vertex: T): boolean => {
		visited.add(vertex);
		recursionStack.add(vertex);

		const neighbors = graph.get(vertex) || [];
		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				if (!dfs(neighbor)) {
					return false; // Cycle detected
				}
			} else if (recursionStack.has(neighbor)) {
				return false; // Cycle detected
			}
		}

		recursionStack.delete(vertex);
		sorted.unshift(vertex); // Add the vertex to the beginning of the list
		return true;
	};

	// Perform DFS for all vertices
	for (const vertex of vertices) {
		if (!visited.has(vertex)) {
			if (!dfs(vertex)) {
				return null; // Graph has a cycle, topological sort not possible
			}
		}
	}

	return sorted;
}
