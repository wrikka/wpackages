import { WeightedGraph } from '@w/utils-data-structure';
import { aStar } from './a-star';

// Example with a grid-like graph where nodes are represented by objects with x and y coordinates.
interface Point {
  x: number;
  y: number;
}

const graph = new WeightedGraph<Point>();

const points: Point[] = [
  { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
];

points.forEach(p => graph.addVertex(p));

// A simple grid connection logic
if (points[0] && points[1]) graph.addEdge(points[0], points[1], 1);
if (points[1] && points[2]) graph.addEdge(points[1], points[2], 1);
if (points[3] && points[4]) graph.addEdge(points[3], points[4], 1);
if (points[4] && points[5]) graph.addEdge(points[4], points[5], 1);
if (points[6] && points[7]) graph.addEdge(points[6], points[7], 1);
if (points[7] && points[8]) graph.addEdge(points[7], points[8], 1);
if (points[0] && points[3]) graph.addEdge(points[0], points[3], 1);
if (points[1] && points[4]) graph.addEdge(points[1], points[4], 1);
if (points[2] && points[5]) graph.addEdge(points[2], points[5], 1);
if (points[3] && points[6]) graph.addEdge(points[3], points[6], 1);
if (points[4] && points[7]) graph.addEdge(points[4], points[7], 1);
if (points[5] && points[8]) graph.addEdge(points[5], points[8], 1);

// Heuristic function (Manhattan distance)
const heuristic = (a: Point, b: Point) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const startNode = points[0];
const endNode = points[8];

if (startNode && endNode) {
  const path = aStar(graph, startNode, endNode, heuristic);
  console.log('Path found by A*:', path);
} else {
  console.log('Start or end node is missing.');
}

