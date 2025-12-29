import { Graph } from './graph';

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

// 4. Print the graph's adjacency list
console.log('Graph Adjacency List:');
graph.printGraph();
// Output:
// A -> B, C
// B -> A, D
// C -> A, E
// D -> B, E, F
// E -> C, D, F
// F -> D, E

// 5. Perform Breadth-First Search (BFS)
const bfsResult: string[] = [];
graph.bfs('A', (vertex) => bfsResult.push(vertex));
console.log('\nBFS starting from A:', bfsResult.join(' -> ')); // e.g., A -> B -> C -> D -> E -> F

// 6. Perform Depth-First Search (DFS)
const dfsResult: string[] = [];
graph.dfs('A', (vertex) => dfsResult.push(vertex));
console.log('DFS starting from A:', dfsResult.join(' -> ')); // e.g., A -> B -> D -> E -> C -> F
