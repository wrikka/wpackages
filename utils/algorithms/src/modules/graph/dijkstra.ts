import { PriorityQueue, WeightedGraph } from '@w/utils-data-structure';

export function dijkstra<T>(graph: WeightedGraph<T>, startVertex: T): { distances: Map<T, number>, previous: Map<T, T | null> } {
  const distances = new Map<T, number>();
  const previous = new Map<T, T | null>();
  const pq = new PriorityQueue<T>();
  const adjacencyList = graph.getAdjacencyList();

  // Initialization
  for (const vertex of adjacencyList.keys()) {
    if (vertex === startVertex) {
      distances.set(vertex, 0);
      pq.enqueue(vertex, 0);
    } else {
      distances.set(vertex, Infinity);
      pq.enqueue(vertex, Infinity);
    }
    previous.set(vertex, null);
  }

  while (!pq.isEmpty()) {
    const currentVertex = pq.dequeue();

    if (currentVertex === undefined) break; 

    const neighbors = adjacencyList.get(currentVertex);
    if (!neighbors) continue;

    for (const neighbor of neighbors) {
      const distance = distances.get(currentVertex)! + neighbor.weight;

      if (distance < distances.get(neighbor.node)!) {
        distances.set(neighbor.node, distance);
        previous.set(neighbor.node, currentVertex);
        pq.enqueue(neighbor.node, distance);
      }
    }
  }

  return { distances, previous };
}
