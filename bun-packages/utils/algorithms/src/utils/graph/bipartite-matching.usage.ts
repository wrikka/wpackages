import { bipartiteMatching } from "./bipartite-matching";

const graph = {
	A: ["X", "Y"],
	B: ["Y", "Z"],
	C: ["X"],
	D: ["Z"],
};

const leftSet = ["A", "B", "C", "D"];
const rightSet = ["X", "Y", "Z"];

const matching = bipartiteMatching(graph, leftSet, rightSet);

console.log("Bipartite Matching:");
matching.forEach(([left, right]) => {
	console.log(`${left} -- ${right}`);
});

console.log("Maximum matching size:", matching.length);
