import { breadthFirstSearch } from "./breadth-first-search";

const graph = {
	A: ["B", "C"],
	B: ["A", "D", "E"],
	C: ["A", "F"],
	D: ["B"],
	E: ["B", "F"],
	F: ["C", "E"],
};

const path = breadthFirstSearch(graph, "A", "F");

if (path) {
	console.log("Path found:", path.join(" -> "));
} else {
	console.log("No path found.");
}
