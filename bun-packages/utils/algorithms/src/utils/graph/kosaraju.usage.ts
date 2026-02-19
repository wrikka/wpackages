import { kosaraju } from "./kosaraju";

const graph = {
	A: ["B"],
	B: ["C"],
	C: ["A", "D"],
	D: ["E"],
	E: ["F"],
	F: ["D"],
};

const sccs = kosaraju(graph);

console.log("Strongly Connected Components:");
sccs.forEach((scc, index) => {
	console.log(`Component ${index + 1}:`, scc.join(", "));
});
