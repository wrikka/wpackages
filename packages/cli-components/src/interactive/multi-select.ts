/**
 * Interactive Terminal Prompts
 * เหมือน @clack/prompts แต่ดีกว่า!
 */

import { createInterface } from "node:readline";
import { colors } from "../constant/color.const";
import { SYMBOLS } from "../constant/symbol.const";

/**
 * Interactive multi-select prompt
 */
export async function interactiveMultiSelect<T>(options: {
	readonly message: string;
	readonly options: readonly { readonly value: T; readonly label: string }[];
}): Promise<T[]> {
	console.log(`${colors.cyan(SYMBOLS.pointer)} ${options.message}`);
	console.log(colors.dim("  (Space to select, Enter to confirm)"));
	console.log();

	// Display options
	options.options.forEach((opt, i) => {
		const checkbox = colors.dim(SYMBOLS.checkbox);
		const label = opt.label;
		console.log(`  ${checkbox} ${i + 1}. ${label}`);
	});

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(colors.dim("\n  Enter numbers (e.g., 1,3,4): "), (answer) => {
			rl.close();

			const indices = answer
				.split(",")
				.map((s) => Number.parseInt(s.trim(), 10) - 1)
				.filter(
					(i) => !Number.isNaN(i) && i >= 0 && i < options.options.length,
				);

			const selected = indices.map((i) => options.options[i]);

			if (selected.length === 0) {
				console.log(colors.yellow(`  ${SYMBOLS.warning} No selection`));
				resolve([]);
				return;
			}

			console.log(
				colors.dim(`  ${SYMBOLS.success} Selected ${selected.length} items`),
			);
			selected.forEach((s) => {
				if (s) console.log(colors.dim(`    - ${s.label}`));
			});
			console.log();

			resolve(selected.filter((s) => s !== undefined).map((s) => s.value));
		});
	});
}
