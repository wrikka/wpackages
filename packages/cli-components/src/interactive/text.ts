/**
 * Interactive Terminal Prompts
 * เหมือน @clack/prompts แต่ดีกว่า!
 */

import { createInterface } from "node:readline";
import { colors } from "../constant/color.const";
import { SYMBOLS } from "../constant/symbol.const";
import type { TextPromptOptions } from "../types/prompt.types";

/**
 * Interactive text prompt
 */
export async function interactiveText(
	options: TextPromptOptions,
): Promise<string> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		const placeholder = options.placeholder
			? colors.dim(` (${options.placeholder})`)
			: "";
		const prompt = `${colors.cyan(SYMBOLS.pointer)} ${options.message}${placeholder}\n${colors.dim("  ")}`;

		rl.question(prompt, (answer) => {
			rl.close();
			const value = answer.trim() || options.initial || options.placeholder || "";

			// Validate
			if (options.validate) {
				const result = options.validate(value);
				if (result !== true) {
					console.log(colors.red(`  ${SYMBOLS.error} ${result}`));
					resolve(interactiveText(options));
					return;
				}
			}

			console.log(colors.dim(`  ${SYMBOLS.success} ${value}`));
			resolve(value);
		});
	});
}
