import { findArticulationPoints } from "./articulation-points";

const graph = {
	A: ["B", "C"],
	B: ["A", "D", "E"],
	C: ["A", "F"],
	D: ["B"],
	E: ["B", "F"],
	F: ["C", "E"],
};

const articulationPoints = findArticulationPoints(graph);

console.log("Articulation Points:", articulationPoints.join(", "));
