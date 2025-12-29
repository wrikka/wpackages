import { Graph } from '@w/utils-data-structure';
import { depthFirstSearch } from '../graph/depth-first-search';

// 1. Create a new Graph
const graph = new Graph<string>();

// 2. Add vertices
graph.addVertex('A');
graph.addVertex('B');
graph.addVertex('C');
graph.addVertex('D');
graph.addVertex('E');
graph.addVertex('F');

// 3. Add edges
graph.addEdge('A', 'B');
graph.addEdge('A', 'C');
graph.addEdge('B', 'D');
graph.addEdge('C', 'E');
graph.addEdge('D', 'E');
graph.addEdge('D', 'F');
graph.addEdge('E', 'F');

// 4. Perform Depth-First Search (DFS)
console.log('DFS starting from A:');
const dfsResult: string[] = [];
depthFirstSearch(graph, 'A', (vertex: string) => {
  dfsResult.push(vertex);
  console.log(`Visited: ${vertex}`);
});

console.log('\nDFS traversal path:', dfsResult.join(' -> '));
// Example Output:
// Visited: A
// Visited: B
// Visited: D
// Visited: E
// Visited: C
// Visited: F
// DFS traversal path: A -> B -> D -> E -> C -> F
// (Note: The exact path can vary depending on the order of neighbors)
