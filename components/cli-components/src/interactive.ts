/**
 * Interactive Terminal Prompts
 * เหมือน @clack/prompts แต่ดีกว่า!
 */

import { createInterface } from "node:readline";
import { colors } from "./constant/color.const";
import { SYMBOLS } from "./constant/symbol.const";
import type { TextPromptOptions } from "./types/prompt.types";

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
