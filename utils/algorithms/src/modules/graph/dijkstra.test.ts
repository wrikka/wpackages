import { WeightedGraph } from '@w/utils-data-structure';
import { describe, it, expect } from 'vitest';
import { dijkstra } from './dijkstra';

describe('dijkstra', () => {
  it('should find the shortest paths in a simple graph', () => {
    const graph = new WeightedGraph<string>();
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addEdge('A', 'B', 1);
    graph.addEdge('A', 'C', 4);
    graph.addEdge('B', 'C', 2);

    const { distances } = dijkstra(graph, 'A');

    expect(distances.get('A')).toBe(0);
    expect(distances.get('B')).toBe(1);
    expect(distances.get('C')).toBe(3);
  });

  it('should handle a more complex graph', () => {
    const graph = new WeightedGraph<string>();
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(v => graph.addVertex(v));

    graph.addEdge('A', 'B', 4);
    graph.addEdge('A', 'C', 2);
    graph.addEdge('B', 'E', 3);
    graph.addEdge('C', 'D', 2);
    graph.addEdge('C', 'F', 4);
    graph.addEdge('D', 'E', 3);
    graph.addEdge('D', 'F', 1);
    graph.addEdge('E', 'F', 1);

    const { distances } = dijkstra(graph, 'A');

    expect(distances.get('A')).toBe(0);
    expect(distances.get('B')).toBe(4);
    expect(distances.get('C')).toBe(2);
    expect(distances.get('D')).toBe(4);
    expect(distances.get('E')).toBe(6);
    expect(distances.get('F')).toBe(5);
  });

  it('should handle graphs with no path between nodes', () => {
    const graph = new WeightedGraph<string>();
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addEdge('A', 'B', 1);

    const { distances } = dijkstra(graph, 'A');

    expect(distances.get('A')).toBe(0);
    expect(distances.get('B')).toBe(1);
    expect(distances.get('C')).toBe(Infinity);
  });
});
