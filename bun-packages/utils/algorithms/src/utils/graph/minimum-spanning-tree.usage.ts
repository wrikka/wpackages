import { minimumSpanningTree } from "./minimum-spanning-tree";

const nodes = ["A", "B", "C", "D"];

const edges = [
	{ from: "A", to: "B", weight: 1 },
	{ from: "A", to: "C", weight: 3 },
	{ from: "B", to: "C", weight: 2 },
	{ from: "B", to: "D", weight: 4 },
	{ from: "C", to: "D", weight: 5 },
];

const mst = minimumSpanningTree(edges, nodes);

console.log("Minimum Spanning Tree edges:");
mst.forEach((edge) => {
	console.log(`${edge.from} --${edge.weight}--> ${edge.to}`);
});

console.log("Total weight:", mst.reduce((sum, e) => sum + e.weight, 0));
