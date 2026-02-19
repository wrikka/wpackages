export type WeightedGraph<T = string> = Map<T, Array<{ node: T; weight: number }>>;

export type Graph<T = string> = Map<T, T[]>;

export type DirectedGraph<T = string> = Graph<T>;
export type UndirectedGraph<T = string> = Graph<T>;
