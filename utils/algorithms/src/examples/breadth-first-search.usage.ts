import { Graph } from '@w/utils-data-structure';
import { breadthFirstSearch } from '../graph/breadth-first-search';

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
graph.addEdge('D', 'F');

// 4. Perform Breadth-First Search (BFS)
console.log('BFS starting from A:');
const bfsResult: string[] = [];
breadthFirstSearch(graph, 'A', (vertex: string) => {
  bfsResult.push(vertex);
  console.log(`Visited: ${vertex}`);
});

console.log('\nBFS traversal path:', bfsResult.join(' -> '));
// Expected Output:
// Visited: A
// Visited: B
// Visited: C
// Visited: D
// Visited: E
// Visited: F
// BFS traversal path: A -> B -> C -> D -> E -> F
