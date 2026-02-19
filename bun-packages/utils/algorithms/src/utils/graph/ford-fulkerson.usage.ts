import { fordFulkerson } from "./ford-fulkerson";

const edges = [
	{ from: "S", to: "A", capacity: 10 },
	{ from: "S", to: "B", capacity: 10 },
	{ from: "A", to: "C", capacity: 4 },
	{ from: "A", to: "D", capacity: 8 },
	{ from: "A", to: "B", capacity: 2 },
	{ from: "B", to: "D", capacity: 9 },
	{ from: "C", to: "T", capacity: 10 },
	{ from: "D", to: "C", capacity: 6 },
	{ from: "D", to: "T", capacity: 10 },
];

const maxFlow = fordFulkerson(edges, "S", "T");

console.log("Maximum Flow:", maxFlow);
