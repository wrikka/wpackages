import { describe, it, expect, beforeEach } from 'vitest';
import { Graph } from '@w/utils-data-structure';
import { depthFirstSearch } from './depth-first-search';

describe('depthFirstSearch', () => {
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

  it('should traverse the graph in DFS order', () => {
    const result: string[] = [];
    depthFirstSearch(graph, 'A', (vertex: string) => result.push(vertex));

    // The exact DFS path can vary based on adjacency list order.
    // We will check if all nodes are visited and the starting node is correct.
    expect(result).toHaveLength(6);
    expect(result[0]).toBe('A');
    expect(new Set(result)).toEqual(new Set(['A', 'B', 'C', 'D', 'E', 'F']));

    // A possible valid DFS path from 'A' is A -> B -> D -> E -> C -> F
    // Another is A -> C -> E -> D -> B -> F
    // We can check for one of these possibilities if the neighbor order is consistent.
    const possiblePath1 = ['A', 'B', 'D', 'E', 'C', 'F'];
    const possiblePath2 = ['A', 'C', 'E', 'D', 'B', 'F'];

    expect([possiblePath1, possiblePath2]).toContainEqual(result);
  });

  it('should handle a graph with a single node', () => {
    const singleNodeGraph = new Graph<string>();
    singleNodeGraph.addVertex('A');
    const result: string[] = [];
    depthFirstSearch(singleNodeGraph, 'A', (vertex: string) => result.push(vertex));
    expect(result).toEqual(['A']);
  });

  it('should handle a disconnected component', () => {
    graph.addVertex('G'); // Disconnected node
    const result: string[] = [];
    depthFirstSearch(graph, 'A', (vertex: string) => result.push(vertex));
    expect(result).toHaveLength(6);
    expect(result.includes('G')).toBe(false);
  });
});
