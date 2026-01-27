export interface WeightedGraph {
	adjacencyList: Record<string, Array<{ node: string; weight: number }>>;
	keys(): string[];
	entries(): Array<[string, Array<{ node: string; weight: number }>]>;
}

export interface Graph {
	adjacencyList: Record<string, string[]>;
	has(node: string): boolean;
	get(node: string): string[] | undefined;
}

export interface DirectedGraph extends Graph {}
export interface UndirectedGraph extends Graph {}
