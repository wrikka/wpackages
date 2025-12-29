import { describe, it, expect, beforeEach } from 'vitest';
import { Graph } from './core/graph';

describe('Graph', () => {
  let graph: Graph<string>;

  beforeEach(() => {
    graph = new Graph<string>();
    graph.addVertex('A');
    graph.addVertex('B');
    graph.addVertex('C');
    graph.addVertex('D');
    graph.addVertex('E');
    graph.addVertex('F');

    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');
    graph.addEdge('B', 'D');
    graph.addEdge('C', 'E');
    graph.addEdge('D', 'E');
    graph.addEdge('D', 'F');
    graph.addEdge('E', 'F');
  });

  it('should add vertices and edges correctly', () => {
    expect(graph.getNeighbors('A')).toEqual(['B', 'C']);
    expect(graph.getNeighbors('B')).toEqual(['A', 'D']);
    expect(graph.getNeighbors('F')).toEqual(['D', 'E']);
  });

  it('should throw an error when adding an edge with non-existent vertices', () => {
    expect(() => graph.addEdge('A', 'G')).toThrow('One or both vertices not found in the graph.');
  });

  it('should perform BFS correctly', () => {
    const bfsResult: string[] = [];
    graph.bfs('A', (vertex: string) => bfsResult.push(vertex));
    // The order can vary depending on implementation details (neighbor order)
    // We'll check for content and length
    expect(bfsResult).toHaveLength(6);
    expect(new Set(bfsResult)).toEqual(new Set(['A', 'B', 'C', 'D', 'E', 'F']));
    expect(bfsResult[0]).toBe('A');
  });

  it('should perform DFS correctly', () => {
    const dfsResult: string[] = [];
    graph.dfs('A', (vertex: string) => dfsResult.push(vertex));
    // The order can vary depending on implementation details (neighbor order)
    // We'll check for content and length
    expect(dfsResult).toHaveLength(6);
    expect(new Set(dfsResult)).toEqual(new Set(['A', 'B', 'D', 'E', 'C', 'F']));
    expect(dfsResult[0]).toBe('A');
  });
});
