import { type WeightedGraph } from "../data-structures";

interface Edge {
	u: string;
	v: string;
	weight: number;
}

type DSU = {
	parent: Map<string, string>;
	rank: Map<string, number>;
};

function createDSU(vertices: string[]): DSU {
	const parent = new Map<string, string>();
	const rank = new Map<string, number>();
	for (const v of vertices) {
		parent.set(v, v);
		rank.set(v, 0);
	}
	return { parent, rank };
}

function dsuFind(dsu: DSU, x: string): string {
	const p = dsu.parent.get(x);
	if (p === undefined) {
		dsu.parent.set(x, x);
		dsu.rank.set(x, 0);
		return x;
	}
	if (p !== x) {
		const root = dsuFind(dsu, p);
		dsu.parent.set(x, root);
		return root;
	}
	return x;
}

function dsuUnion(dsu: DSU, x: string, y: string): void {
	const rootX = dsuFind(dsu, x);
	const rootY = dsuFind(dsu, y);
	if (rootX === rootY) return;

	const rankX = dsu.rank.get(rootX) ?? 0;
	const rankY = dsu.rank.get(rootY) ?? 0;

	if (rankX < rankY) {
		dsu.parent.set(rootX, rootY);
		return;
	}
	if (rankX > rankY) {
		dsu.parent.set(rootY, rootX);
		return;
	}

	dsu.parent.set(rootY, rootX);
	dsu.rank.set(rootX, rankX + 1);
}

export function kruskalsAlgorithm(graph: WeightedGraph<string>): Edge[] {
	const vertices = Array.from(graph.keys());
	const edges: Edge[] = [];

	// Create a list of all unique edges
	for (const [u, neighbors] of graph.entries()) {
		for (const { node: v, weight } of neighbors) {
			// Avoid duplicate edges in an undirected graph representation
			if (u < v) {
				edges.push({ u, v, weight });
			}
		}
	}

	// Sort edges by weight in ascending order
	edges.sort((a, b) => a.weight - b.weight);

	const dsu = createDSU(vertices);
	const mst: Edge[] = [];

	for (const edge of edges) {
		const { u, v } = edge;
		const rootU = dsuFind(dsu, u);
		const rootV = dsuFind(dsu, v);

		if (rootU !== rootV) {
			mst.push(edge);
			dsuUnion(dsu, u, v);
		}
	}

	return mst;
}
