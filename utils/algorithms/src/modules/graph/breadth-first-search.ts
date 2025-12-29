import { Graph, Queue } from '@w/utils-data-structure';

export function breadthFirstSearch<T>(
  graph: Graph<T>,
  startVertex: T,
  callback: (vertex: T) => void
): void {
  const visited = new Set<T>();
  const queue = new Queue<T>();

  visited.add(startVertex);
  queue.enqueue(startVertex);

  while (!queue.isEmpty()) {
    const currentVertex = queue.dequeue();
    if (currentVertex === undefined) continue;

    callback(currentVertex);

    const neighbors = graph.getNeighbors(currentVertex);
    if (neighbors) {
      for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.enqueue(neighbor);
      }
    }
  }}
}
