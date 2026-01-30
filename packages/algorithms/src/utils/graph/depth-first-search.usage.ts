import { type Graph } from "../data-structures";
import { depthFirstSearch } from "./depth-first-search";

const graph: Graph<string> = new Map([
	["A", ["B", "C"]],
	["B", ["D", "E"]],
	["C", ["F"]],
	["D", []],
	["E", ["F"]],
	["F", []],
]);

const startNode = "A";
const traversalPath = depthFirstSearch(graph, startNode);

console.log(`DFS traversal starting from ${startNode}:`, traversalPath);
// Expected output (one of the possibilities): DFS traversal starting from A: [ 'A', 'B', 'D', 'E', 'F', 'C' ]
