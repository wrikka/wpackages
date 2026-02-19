/**
 * Interactive Terminal Prompts
 * เหมือน @clack/prompts แต่ดีกว่า!
 */

import { createInterface } from "node:readline";
import { colors } from "../constant/color.const";
import { SYMBOLS } from "../constant/symbol.const";

/**
 * Interactive select prompt
 */
export async function interactiveSelect<T>(options: {
	readonly message: string;
	readonly options: readonly {
		readonly value: T;
		readonly label: string;
		readonly description?: string;
	}[];
}): Promise<T> {
	console.log(`${colors.cyan(SYMBOLS.pointer)} ${options.message}`);
	console.log();

	// Display options
	options.options.forEach((opt, i) => {
		const num = colors.cyan(`  ${i + 1}.`);
		const label = colors.bright(opt.label);
		const desc = opt.description ? colors.dim(` - ${opt.description}`) : "";
		console.log(`${num} ${label}${desc}`);
	});

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(colors.dim("\n  Enter number: "), (answer) => {
			rl.close();
			const index = Number.parseInt(answer.trim(), 10) - 1;

			if (Number.isNaN(index) || index < 0 || index >= options.options.length) {
				console.log(colors.red(`  ${SYMBOLS.error} Invalid selection`));
				resolve(interactiveSelect(options));
				return;
			}

			const selected = options.options[index];
			if (!selected) {
				console.log(colors.red(`  ${SYMBOLS.error} Invalid selection`));
				resolve(interactiveSelect(options));
				return;
			}
			console.log(colors.dim(`  ${SYMBOLS.success} ${selected.label}`));
			console.log();
			resolve(selected.value);
		});
	});
}
