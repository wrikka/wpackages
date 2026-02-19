import { type WeightedGraph } from "../data-structures";
import { bellmanFord } from "./bellman-ford";

const graph: WeightedGraph<string> = new Map([
	["S", [{ node: "A", weight: 4 }, { node: "E", weight: -5 }]],
	["A", [{ node: "C", weight: -2 }]],
	["B", [{ node: "A", weight: 3 }]],
	["C", [{ node: "D", weight: 1 }]],
	["D", [{ node: "B", weight: -1 }]],
	["E", [{ node: "D", weight: 2 }]],
]);

const startNode = "S";
const result = bellmanFord(graph, startNode);

if (result.hasNegativeCycle) {
	console.log("Graph contains a negative-weight cycle.");
} else {
	console.log("Distances:", result.distances);
	console.log("Previous nodes:", result.previous);
}
