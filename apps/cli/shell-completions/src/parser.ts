import { generateSuggestions } from "./dynamic-generators";
import type { CompletionSpec, Subcommand, Suggestion } from "./schema";

export async function parse(
	commandLine: string,
	spec: CompletionSpec,
): Promise<Suggestion[]> {
	const parts = commandLine.split(/\s+/);
	const wordToComplete = parts[parts.length - 1];

	let currentCommand: CompletionSpec | Subcommand = spec;
	let commandDepth = 0;

	for (let i = 1; i < parts.length - 1; i++) {
		const part = parts[i];
		const sub = (currentCommand.subcommands || []).find((s) => s.name === part);
		if (sub) {
			currentCommand = sub;
			commandDepth = i;
		} else {
			// Not a subcommand, must be an argument
			break;
		}
	}

	// If the number of parts is one greater than the command depth, we are completing an argument
	const isCompletingArgument = parts.length - 1 > commandDepth;

	if (isCompletingArgument && currentCommand.args) {
		const arg = currentCommand.args[0];
		if (arg.generators) {
			const generator = Array.isArray(arg.generators)
				? arg.generators[0]
				: arg.generators;
			return generateSuggestions(generator, wordToComplete);
		}
	}

	// Otherwise, suggest subcommands
	const subcommands = currentCommand.subcommands || [];
	return subcommands.filter((s) => {
		const name = Array.isArray(s.name) ? s.name[0] : s.name;
		return name.startsWith(wordToComplete);
	});
}
