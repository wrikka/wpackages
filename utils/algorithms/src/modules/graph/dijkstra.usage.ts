import { WeightedGraph } from '@w/utils-data-structure';
import { dijkstra } from './dijkstra';

const graph = new WeightedGraph<string>();

graph.addVertex('A');
graph.addVertex('B');
graph.addVertex('C');
graph.addVertex('D');
graph.addVertex('E');
graph.addVertex('F');

graph.addEdge('A', 'B', 4);
graph.addEdge('A', 'C', 2);
graph.addEdge('B', 'E', 3);
graph.addEdge('C', 'D', 2);
graph.addEdge('C', 'F', 4);
graph.addEdge('D', 'E', 3);
graph.addEdge('D', 'F', 1);
graph.addEdge('E', 'F', 1);

const { distances, previous } = dijkstra(graph, 'A');

console.log('Distances:', distances);
console.log('Previous:', previous);
