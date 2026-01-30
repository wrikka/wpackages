import type { AdjacencyListGraph } from "./types";

export function bipartiteMatching(graph: AdjacencyListGraph, leftSet: string[], rightSet: string[]): [string, string][] {
	const matchR = new Map<string, string | null>();
	for (const u of rightSet) {
		matchR.set(u, null);
	}

	function bpm(u: string, seen: Set<string>): boolean {
		for (const v of graph[u] || []) {
			if (seen.has(v)) continue;
			seen.add(v);

			if (matchR.get(v) === null || bpm(matchR.get(v)!, seen)) {
				matchR.set(v, u);
				return true;
			}
		}
		return false;
	}

	const result: [string, string][] = [];

	for (const u of leftSet) {
		const seen = new Set<string>();
		if (bpm(u, seen)) {
			for (const [v, matchedU] of matchR) {
				if (matchedU === u) {
					result.push([u, v]);
					break;
				}
			}
		}
	}

	return result;
}
