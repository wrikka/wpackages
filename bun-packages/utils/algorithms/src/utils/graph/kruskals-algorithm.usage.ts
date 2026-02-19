import { type WeightedGraph } from "../data-structures";
import { kruskalsAlgorithm } from "./kruskals-algorithm";

const graph: WeightedGraph<string> = new Map([
	["A", [{ node: "B", weight: 2 }, { node: "D", weight: 3 }]],
	["B", [{ node: "A", weight: 2 }, { node: "C", weight: 3 }, { node: "D", weight: 5 }]],
	["C", [{ node: "B", weight: 3 }, { node: "D", weight: 1 }]],
	["D", [{ node: "A", weight: 3 }, { node: "B", weight: 5 }, { node: "C", weight: 1 }]],
]);

const mst = kruskalsAlgorithm(graph);
const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);

console.log("Edges in the Minimum Spanning Tree:", mst);
console.log("Total weight of MST:", totalWeight);
