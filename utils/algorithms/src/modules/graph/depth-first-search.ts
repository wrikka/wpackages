import { Graph } from '@w/utils-data-structure';

export const depthFirstSearch = <T>(
  graph: Graph<T>,
  startNode: T,
  callback: (vertex: T) => void,
): void => {
  const visited = new Set<T>();

  const dfsRecursive = (vertex: T) => {
    if (!vertex || !graph.getNeighbors(vertex)) return;

    visited.add(vertex);
    callback(vertex);

    const neighbors = graph.getNeighbors(vertex);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfsRecursive(neighbor);
        }
      }
    }
  };

  dfsRecursive(startNode);
};
