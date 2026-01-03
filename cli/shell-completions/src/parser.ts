import { CompletionSpec, Suggestion } from "./schema";

export function parse(commandLine: string, spec: CompletionSpec): Suggestion[] {
	const parts = commandLine.trim().split(" ");

	if (parts.length <= 2) {
		const wordToComplete = parts.length === 2 ? parts[1] : "";

		const subcommands = spec.subcommands || [];
		const options = spec.options || [];

		const allSuggestions = [...subcommands, ...options];

		return allSuggestions.filter((s) => {
			const name = Array.isArray(s.name) ? s.name[0] : s.name;
			return name.startsWith(wordToComplete);
		});
	}

	// More complex parsing logic will go here.
	return [];
}
