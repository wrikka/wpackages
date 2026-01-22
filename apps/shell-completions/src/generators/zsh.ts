import type { Suggestion } from "../schema";

export function generateZshOutput(suggestions: Suggestion[]): void {
	// Zsh can handle descriptions alongside the suggestions.
	// The format is: suggestion:description
	suggestions.forEach((s) => {
		const name = Array.isArray(s.name) ? s.name[0] : s.name;
		const description = s.description ? `:${s.description}` : "";
		// To prevent issues with colons in the suggestion name, we can escape them.
		const escapedName = name.replace(/:/g, "\\:");
		console.log(`${escapedName}${description}`);
	});
}
