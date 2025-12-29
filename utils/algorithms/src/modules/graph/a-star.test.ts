import { WeightedGraph } from '@w/utils-data-structure';
import { describe, it, expect } from 'vitest';
import { aStar } from './a-star';

describe('aStar', () => {
  interface Point {
    x: number;
    y: number;
    id: string;
  }

  const heuristic = (a: Point, b: Point) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  it('should find the shortest path in a simple grid', () => {
    const graph = new WeightedGraph<Point>();
    const points = [
      { id: 'A', x: 0, y: 0 }, { id: 'B', x: 1, y: 0 }, { id: 'C', x: 2, y: 0 },
      { id: 'D', x: 0, y: 1 }, { id: 'E', x: 1, y: 1 }, { id: 'F', x: 2, y: 1 },
      { id: 'G', x: 0, y: 2 }, { id: 'H', x: 1, y: 2 }, { id: 'I', x: 2, y: 2 },
    ];

    points.forEach(p => graph.addVertex(p));

    graph.addEdge(points[0], points[1], 1); // A-B
    graph.addEdge(points[1], points[2], 1); // B-C
    graph.addEdge(points[0], points[3], 1); // A-D
    graph.addEdge(points[1], points[4], 1); // B-E
    graph.addEdge(points[3], points[4], 1); // D-E
    graph.addEdge(points[4], points[5], 1); // E-F
    graph.addEdge(points[3], points[6], 1); // D-G
    graph.addEdge(points[4], points[7], 1); // E-H
    graph.addEdge(points[5], points[8], 1); // F-I
    graph.addEdge(points[7], points[8], 1); // H-I

    const path = aStar(graph, points[0], points[8], heuristic);
    const pathIds = path?.map(p => p.id);

    // One possible shortest path
    expect(pathIds).toEqual(['A', 'D', 'E', 'H', 'I']);
  });

  it('should return null if no path is found', () => {
    const graph = new WeightedGraph<Point>();
    const points = [
      { id: 'A', x: 0, y: 0 }, { id: 'B', x: 1, y: 0 },
      { id: 'C', x: 0, y: 1 }, { id: 'D', x: 1, y: 1 },
    ];

    points.forEach(p => graph.addVertex(p));
    graph.addEdge(points[0], points[1], 1); // A-B
    // No connection to C or D

    const path = aStar(graph, points[0], points[3], heuristic);
    expect(path).toBeNull();
  });

  it('should handle a direct path', () => {
    const graph = new WeightedGraph<Point>();
    const points = [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 5, y: 5 }];
    points.forEach(p => graph.addVertex(p));
    graph.addEdge(points[0], points[1], 10);

    const path = aStar(graph, points[0], points[1], heuristic);
    const pathIds = path?.map(p => p.id);
    expect(pathIds).toEqual(['A', 'B']);
  });
});
