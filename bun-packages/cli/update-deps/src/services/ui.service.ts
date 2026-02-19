import chalk from "chalk";
import prompts from "prompts";
import type { Choice } from "../types";

export class UiService {
	showMessage(message: string, color: "blue" | "green" | "yellow" | "red" = "blue"): void {
		console.log(chalk[color](message));
	}

	async getPackageSelection(choices: Choice[]): Promise<any[]> {
		const response = await prompts({
			type: "multiselect",
			name: "packagesToUpdate",
			message: "Select packages to update (press space to select, enter to confirm)",
			choices,
			instructions:
				"\nInstructions:\n    ↑/↓: Highlight option\n    ←/→/[space]: Toggle selection\n    a: Toggle all\n    enter/return: Complete answer",
		});
		return response.packagesToUpdate || [];
	}
}
