import { findBridges } from "./bridges";

const graph = {
	A: ["B", "C"],
	B: ["A", "D"],
	C: ["A", "D"],
	D: ["B", "C", "E"],
	E: ["D"],
};

const bridges = findBridges(graph);

console.log("Bridges:");
bridges.forEach(([from, to]) => {
	console.log(`${from} -- ${to}`);
});
