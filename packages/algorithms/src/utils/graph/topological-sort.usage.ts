import { type Graph } from "../data-structures";
import { topologicalSort } from "./topological-sort";

const graph: Graph<string> = new Map([
	["A", ["C"]],
	["B", ["C", "D"]],
	["C", ["E"]],
	["D", ["F"]],
	["E", ["F"]],
	["F", []],
]);

const sortedOrder = topologicalSort(graph);

if (sortedOrder) {
	console.log("Topological Sort Order:", sortedOrder);
} else {
	console.log("The graph has a cycle, so a topological sort is not possible.");
}
