import { loadSpec } from "./engine";
import { generateBashOutput } from "./generators/bash";
import { generateFishOutput } from "./generators/fish";
import { generatePowerShellOutput } from "./generators/powershell";
import { generateZshOutput } from "./generators/zsh";
import { parse } from "./parser";

type ShellType = "powershell" | "bash" | "zsh" | "fish";

export async function runCompleter(
	shell: ShellType,
	commandLine: string,
	commandName: string,
) {
	if (!commandName) {
		return;
	}

	const spec = loadSpec(commandName);

	if (spec) {
		const suggestions = await parse(commandLine, spec);

		switch (shell) {
			case "powershell":
				generatePowerShellOutput(suggestions);
				break;
			case "bash":
				generateBashOutput(suggestions);
				break;
			case "zsh":
				generateZshOutput(suggestions);
				break;
			case "fish":
				generateFishOutput(suggestions);
				break;
			// Add cases for other shells later
			default:
				// Do nothing or throw an error
				break;
		}
	}
}
