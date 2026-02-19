/**
 * Interactive Terminal Prompts
 * เหมือน @clack/prompts แต่ดีกว่า!
 */

import { createInterface } from "node:readline";
import { colors } from "../constant/color.const";
import { SYMBOLS } from "../constant/symbol.const";

/**
 * Interactive number prompt
 */
export async function interactiveNumber(options: {
	readonly message: string;
	readonly initial?: number;
	readonly validate?: (v: number) => boolean | string;
}): Promise<number> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		const initial = options.initial !== undefined ? colors.dim(` (${options.initial})`) : "";
		const prompt = `${colors.cyan(SYMBOLS.pointer)} ${options.message}${initial}\n${colors.dim("  ")}`;

		rl.question(prompt, (answer) => {
			rl.close();
			const value = answer.trim() ? Number(answer) : options.initial || 0;

			if (Number.isNaN(value)) {
				console.log(colors.red(`  ${SYMBOLS.error} Please enter a number`));
				resolve(interactiveNumber(options));
				return;
			}

			// Validate
			if (options.validate) {
				const result = options.validate(value);
				if (result !== true) {
					console.log(colors.red(`  ${SYMBOLS.error} ${result}`));
					resolve(interactiveNumber(options));
					return;
				}
			}

			console.log(colors.dim(`  ${SYMBOLS.success} ${value}`));
			resolve(value);
		});
	});
}
