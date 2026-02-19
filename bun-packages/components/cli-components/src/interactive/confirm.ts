/**
 * Interactive Terminal Prompts
 * เหมือน @clack/prompts แต่ดีกว่า!
 */

import { createInterface } from "node:readline";
import { colors } from "../constant/color.const";
import { SYMBOLS } from "../constant/symbol.const";

/**
 * Interactive confirm prompt
 */
export async function interactiveConfirm(options: {
	readonly message: string;
	readonly initial?: boolean;
}): Promise<boolean> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		const initial = options.initial !== false ? "Y/n" : "y/N";
		const prompt = `${colors.cyan(SYMBOLS.pointer)} ${options.message} ${colors.dim(`(${initial})`)}\n${
			colors.dim("  ")
		}`;

		rl.question(prompt, (answer) => {
			rl.close();
			const input = answer.trim().toLowerCase();

			let value: boolean;
			if (!input) {
				value = options.initial !== false;
			} else {
				value = input === "y" || input === "yes";
			}

			const display = value ? colors.green("Yes") : colors.yellow("No");
			console.log(colors.dim(`  ${SYMBOLS.success} ${display}`));
			resolve(value);
		});
	});
}
