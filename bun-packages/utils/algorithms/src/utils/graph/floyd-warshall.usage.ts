import { type WeightedGraph } from "../data-structures";
import { floydWarshall } from "./floyd-warshall";

const graph: WeightedGraph<string> = new Map([
	["A", [{ node: "B", weight: 3 }, { node: "C", weight: 8 }, { node: "E", weight: -4 }]],
	["B", [{ node: "D", weight: 1 }, { node: "C", weight: 7 }]],
	["C", [{ node: "B", weight: 4 }]],
	["D", [{ node: "A", weight: 2 }, { node: "C", weight: -5 }]],
	["E", [{ node: "D", weight: 6 }]],
]);

const { dist, next } = floydWarshall(graph);

console.log("All-pairs shortest path distances:");
console.table(dist);

console.log("\nNext node matrix for path reconstruction:");
console.table(next);
