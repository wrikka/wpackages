export type Shell = "bash" | "zsh" | "fish" | "pwsh" | "cmd";

export function detectShell(): Shell {
	const shell = process.env.SHELL || process.env.COMSPEC;

	if (!shell) {
		return "bash"; // Default to bash if detection fails
	}

	if (shell.includes("bash")) return "bash";
	if (shell.includes("zsh")) return "zsh";
	if (shell.includes("fish")) return "fish";
	if (shell.includes("pwsh")) return "pwsh";
	if (shell.includes("cmd")) return "cmd";

	return "bash"; // Fallback
}
