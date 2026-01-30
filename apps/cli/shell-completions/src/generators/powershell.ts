import type { Suggestion } from "../schema";

export function generatePowerShellOutput(suggestions: Suggestion[]): void {
	// Output suggestions for PowerShell to consume.
	// We will use CompletionResult format later.
	suggestions.forEach((s) => {
		const name = Array.isArray(s.name) ? s.name[0] : s.name;
		console.log(name);
	});
}
