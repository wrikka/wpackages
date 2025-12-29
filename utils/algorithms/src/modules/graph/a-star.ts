import { PriorityQueue, WeightedGraph } from '@w/utils-data-structure';

function reconstructPath<T>(cameFrom: Map<T, T | null>, current: T): T[] {
  const totalPath: T[] = [current];
  let tempCurrent = current;
  while (cameFrom.has(tempCurrent) && cameFrom.get(tempCurrent) !== null) {
    tempCurrent = cameFrom.get(tempCurrent)!;
    totalPath.unshift(tempCurrent);
  }
  return totalPath;
}

export function aStar<T>(
  graph: WeightedGraph<T>,
  startVertex: T,
  endVertex: T,
  heuristic: (a: T, b: T) => number
): T[] | null {
  const openSet = new PriorityQueue<T>();
  const cameFrom = new Map<T, T | null>();

  const gScore = new Map<T, number>();
  const fScore = new Map<T, number>();

  const adjacencyList = graph.getAdjacencyList();

  for (const vertex of adjacencyList.keys()) {
    gScore.set(vertex, Infinity);
    fScore.set(vertex, Infinity);
  }

  gScore.set(startVertex, 0);
  fScore.set(startVertex, heuristic(startVertex, endVertex));

  openSet.enqueue(startVertex, fScore.get(startVertex)!);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();

    if (current === undefined) break;

    if (current === endVertex) {
      return reconstructPath(cameFrom, current);
    }

    const neighbors = adjacencyList.get(current);
    if (!neighbors) continue;

    for (const neighbor of neighbors) {
      const tentativeGScore = gScore.get(current)! + neighbor.weight;

      if (tentativeGScore < gScore.get(neighbor.node)!) {
        cameFrom.set(neighbor.node, current);
        gScore.set(neighbor.node, tentativeGScore);
        fScore.set(neighbor.node, tentativeGScore + heuristic(neighbor.node, endVertex));
        openSet.enqueue(neighbor.node, fScore.get(neighbor.node)!);
      }
    }
  }

  // Open set is empty but goal was never reached
  return null;
}
