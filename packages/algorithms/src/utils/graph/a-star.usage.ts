import { aStar } from "./a-star";

const nodes = [
	{ id: "A", x: 0, y: 0 },
	{ id: "B", x: 1, y: 0 },
	{ id: "C", x: 0, y: 1 },
	{ id: "D", x: 1, y: 1 },
];

const edges = [
	{ from: "A", to: "B", weight: 1 },
	{ from: "A", to: "C", weight: 1 },
	{ from: "B", to: "D", weight: 1 },
	{ from: "C", to: "D", weight: 1 },
];

const path = aStar(nodes, edges, "A", "D");

if (path) {
	console.log("Path found:", path.join(" -> "));
} else {
	console.log("No path found.");
}
