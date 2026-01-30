import type { Suggestion } from "../schema";

export function generateBashOutput(suggestions: Suggestion[]): void {
	// Bash expects a newline-separated list of suggestions.
	suggestions.forEach((s) => {
		const name = Array.isArray(s.name) ? s.name[0] : s.name;
		console.log(name);
	});
}
