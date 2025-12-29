import { describe, it, expect, beforeEach } from 'vitest';
import { Graph } from '@w/utils-data-structure';
import { breadthFirstSearch } from './breadth-first-search';

describe('breadthFirstSearch', () => {
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

  it('should traverse the graph in BFS order', () => {
    const result: string[] = [];
    breadthFirstSearch(graph, 'A', (vertex: string) => result.push(vertex));

    // A possible valid BFS path from 'A' is A -> B -> C -> D -> E -> F
    const expectedOrder = ['A', 'B', 'C', 'D', 'E', 'F'];
    expect(result).toEqual(expectedOrder);
  });

  it('should handle a graph with a single node', () => {
    const singleNodeGraph = new Graph<string>();
    singleNodeGraph.addVertex('A');
    const result: string[] = [];
    breadthFirstSearch(singleNodeGraph, 'A', (vertex: string) => result.push(vertex));
    expect(result).toEqual(['A']);
  });

  it('should handle a disconnected component', () => {
    graph.addVertex('G'); // Disconnected node
    const result: string[] = [];
    breadthFirstSearch(graph, 'A', (vertex: string) => result.push(vertex));
    expect(result).toHaveLength(6);
    expect(result.includes('G')).toBe(false);
  });
});
