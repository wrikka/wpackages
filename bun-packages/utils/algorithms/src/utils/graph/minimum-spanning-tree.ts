import type { Edge } from "./types";

export function minimumSpanningTree(edges: Edge[], nodes: string[]): Edge[] {
	const result: Edge[] = [];
	const parent: Record<string, string> = {};
	const rank: Record<string, number> = {};

	for (const node of nodes) {
		parent[node] = node;
		rank[node] = 0;
	}

	function find(node: string): string {
		if (parent[node] !== node) {
			parent[node] = find(parent[node]!);
		}
		return parent[node]!;
	}

	function union(node1: string, node2: string): void {
		const root1 = find(node1);
		const root2 = find(node2);

		if (root1 !== root2) {
			if (rank[root1]! < rank[root2]!) {
				parent[root1] = root2;
			} else if (rank[root1]! > rank[root2]!) {
				parent[root2] = root1;
			} else {
				parent[root2] = root1;
				rank[root1]!++;
			}
		}
	}

	const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

	for (const edge of sortedEdges) {
		if (find(edge.from) !== find(edge.to)) {
			result.push(edge);
			union(edge.from, edge.to);
		}
	}

	return result;
}
