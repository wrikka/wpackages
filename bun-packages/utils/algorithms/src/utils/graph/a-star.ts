export interface GraphNode {
	id: string;
	x: number;
	y: number;
}

import type { Edge } from "./types";

export function aStar(nodes: GraphNode[], edges: Edge[], start: string, goal: string): string[] | null {
	const nodeMap = new Map(nodes.map((n) => [n.id, n]));
	const adjacency = new Map<string, Edge[]>();

	for (const edge of edges) {
		if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
		adjacency.get(edge.from)!.push(edge);
	}

	const heuristic = (nodeId: string): number => {
		const node = nodeMap.get(nodeId)!;
		const goalNode = nodeMap.get(goal)!;
		return Math.abs(node.x - goalNode.x) + Math.abs(node.y - goalNode.y);
	};

	const openSet: string[] = [start];
	const cameFrom = new Map<string, string>();
	const gScore = new Map<string, number>();
	const fScore = new Map<string, number>();

	gScore.set(start, 0);
	fScore.set(start, heuristic(start));

	while (openSet.length > 0) {
		openSet.sort((a, b) => (fScore.get(a) ?? Infinity) - (fScore.get(b) ?? Infinity));
		const current = openSet.shift()!;

		if (current === goal) {
			const path: string[] = [];
			let node = current;
			while (node !== start) {
				path.unshift(node);
				node = cameFrom.get(node)!;
			}
			path.unshift(start);
			return path;
		}

		for (const edge of adjacency.get(current) || []) {
			const tentativeG = (gScore.get(current) ?? Infinity) + edge.weight;

			if (tentativeG < (gScore.get(edge.to) ?? Infinity)) {
				cameFrom.set(edge.to, current);
				gScore.set(edge.to, tentativeG);
				fScore.set(edge.to, tentativeG + heuristic(edge.to));

				if (!openSet.includes(edge.to)) {
					openSet.push(edge.to);
				}
			}
		}
	}

	return null;
}
