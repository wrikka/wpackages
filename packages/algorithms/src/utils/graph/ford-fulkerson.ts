import type { EdgeWithCapacity } from "./types";

export function fordFulkerson(edges: EdgeWithCapacity[], source: string, sink: string): number {
	const graph = new Map<string, Map<string, number>>();

	for (const edge of edges) {
		if (!graph.has(edge.from)) graph.set(edge.from, new Map());
		if (!graph.has(edge.to)) graph.set(edge.to, new Map());
		graph.get(edge.from)!.set(edge.to, edge.capacity);
	}

	let maxFlow = 0;

	function bfs(): string[] | null {
		const parent = new Map<string, string | null>();
		const visited = new Set<string>();
		const queue: string[] = [source];

		visited.add(source);
		parent.set(source, null);

		while (queue.length > 0) {
			const u = queue.shift()!;

			for (const [v, capacity] of graph.get(u)!.entries()) {
				if (!visited.has(v) && capacity > 0) {
					visited.add(v);
					parent.set(v, u);
					if (v === sink) {
						const path: string[] = [];
						let node = sink;
						while (node !== null) {
							path.unshift(node);
							node = parent.get(node)!;
						}
						return path;
					}
					queue.push(v);
				}
			}
		}

		return null;
	}

	while (true) {
		const path = bfs();
		if (!path) break;

		let pathFlow = Infinity;
		for (let i = 0; i < path.length - 1; i++) {
			const u = path[i]!;
			const v = path[i + 1]!;
			pathFlow = Math.min(pathFlow, graph.get(u)!.get(v)!);
		}

		for (let i = 0; i < path.length - 1; i++) {
			const u = path[i]!;
			const v = path[i + 1]!;
			graph.get(u)!.set(v, (graph.get(u)!.get(v) || 0) - pathFlow);
			graph.get(v)!.set(u, (graph.get(v)!.get(u) || 0) + pathFlow);
		}

		maxFlow += pathFlow;
	}

	return maxFlow;
}
