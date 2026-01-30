import type { Suggestion } from "../schema";

export function generateFishOutput(suggestions: Suggestion[]): void {
	// Fish expects a tab-separated list of suggestion and description.
	suggestions.forEach((s) => {
		const name = Array.isArray(s.name) ? s.name[0] : s.name;
		const description = s.description || "";
		console.log(`${name}\t${description}`);
	});
}
