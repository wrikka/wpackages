import { type WeightedGraph } from "../data-structures";
import { dijkstra } from "./dijkstra";

const graph: WeightedGraph<string> = new Map([
	["A", [{ node: "B", weight: 1 }, { node: "C", weight: 4 }]],
	["B", [{ node: "A", weight: 1 }, { node: "C", weight: 2 }, { node: "D", weight: 5 }]],
	["C", [{ node: "A", weight: 4 }, { node: "B", weight: 2 }]],
	["D", [{ node: "B", weight: 5 }]],
]);

const startNode = "A";
const { distances, previous } = dijkstra(graph, startNode);

console.log("Shortest distances from A:", distances);
// Expected: { A: 0, B: 1, C: 3, D: 6 }
console.log("Previous nodes in shortest paths:", previous);
// Expected: { A: null, B: 'A', C: 'B', D: 'B' }
