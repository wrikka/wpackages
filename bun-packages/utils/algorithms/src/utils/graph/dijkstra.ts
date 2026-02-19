import {
	createPriorityQueue,
	pqDequeue,
	pqEnqueue,
	pqIsEmpty,
	type PriorityQueue,
} from "../data-structures";
import { type WeightedGraph } from "../data-structures";

export interface DijkstraResult {
	distances: Record<string, number>;
	previous: Record<string, string | null>;
}

export function dijkstra(
	graph: WeightedGraph<string>,
	startNode: string,
): DijkstraResult {
	const distances: Record<string, number> = {};
	const previous: Record<string, string | null> = {};
	const pq: PriorityQueue<string> = createPriorityQueue<string>();

	for (const vertex of graph.keys()) {
		distances[vertex] = Infinity;
		previous[vertex] = null;
	}

	distances[startNode] = 0;
	pqEnqueue(pq, startNode, 0);

	while (!pqIsEmpty(pq)) {
		const currentNode = pqDequeue(pq);
		if (currentNode === undefined) break;

		const currentDistance = distances[currentNode];
		if (currentDistance === undefined || currentDistance === Infinity) continue;

		const neighbors = graph.get(currentNode) || [];

		for (const neighbor of neighbors) {
			const newDistance = currentDistance + neighbor.weight;
			const neighborDistance = distances[neighbor.node];

			if (neighborDistance !== undefined && newDistance < neighborDistance) {
				distances[neighbor.node] = newDistance;
				previous[neighbor.node] = currentNode;
				pqEnqueue(pq, neighbor.node, newDistance);
			}
		}
	}

	return { distances, previous };
}
