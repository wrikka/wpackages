interface AdjacencyNode<T> {
  node: T;
  weight: number;
}

export class WeightedGraph<T> {
  private adjacencyList: Map<T, AdjacencyNode<T>[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(vertex1: T, vertex2: T, weight: number): void {
    if (this.adjacencyList.has(vertex1) && this.adjacencyList.has(vertex2)) {
      this.adjacencyList.get(vertex1)?.push({ node: vertex2, weight });
      this.adjacencyList.get(vertex2)?.push({ node: vertex1, weight }); // For undirected graph
    } else {
      throw new Error('One or both vertices not found in the graph.');
    }
  }

  getAdjacencyList(): Map<T, AdjacencyNode<T>[]> {
    return this.adjacencyList;
  }

  printGraph(): void {
    for (const [vertex, edges] of this.adjacencyList) {
      const edgeString = edges.map(edge => `${edge.node}(${edge.weight})`).join(', ');
      console.log(`${vertex} -> ${edgeString}`);
    }
  }
}

export class Graph<T> {
  private adjacencyList: Map<T, T[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(vertex1: T, vertex2: T): void {
    if (this.adjacencyList.has(vertex1) && this.adjacencyList.has(vertex2)) {
      this.adjacencyList.get(vertex1)?.push(vertex2);
      this.adjacencyList.get(vertex2)?.push(vertex1); // For undirected graph
    } else {
      throw new Error('One or both vertices not found in the graph.');
    }
  }

  getNeighbors(vertex: T): T[] | undefined {
    return this.adjacencyList.get(vertex);
  }

  bfs(startingNode: T, callback: (vertex: T) => void): void {
    const visited = new Set<T>();
    const queue: T[] = [startingNode];

    visited.add(startingNode);

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      callback(currentNode);

      const neighbors = this.adjacencyList.get(currentNode);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
  }

  dfs(startingNode: T, callback: (vertex: T) => void): void {
    const visited = new Set<T>();

    const dfsRecursive = (vertex: T) => {
      visited.add(vertex);
      callback(vertex);

      const neighbors = this.adjacencyList.get(vertex);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            dfsRecursive(neighbor);
          }
        }
      }
    };

    dfsRecursive(startingNode);
  }

  printGraph(): void {
    for (const [vertex, edges] of this.adjacencyList) {
      console.log(`${vertex} -> ${edges.join(', ')}`);
    }
  }
}
