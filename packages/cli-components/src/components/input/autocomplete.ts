import pc from "picocolors";
import readline from "readline";
import { inputConfig } from "../../config/input.config";

// Custom Prompt Class
export class CustomPrompt {
	private rl: readline.Interface;

	constructor() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	async confirm(options: {
		message: string;
		defaultValue?: string | boolean;
	}): Promise<boolean> {
		return new Promise((resolve) => {
			this.rl.question(
				`${pc.cyan("?")} ${options.message} ${pc.dim("(y/n)")} `,
				(answer) => {
					resolve(/^y$/i.test(answer));
				},
			);
		});
	}

	close() {
		this.rl.close();
	}
}

// Base Prompt Implementation
function createPrompt(options: {
	message: string;
	onRender: () => string;
	onKeyPress: (key: string) => void;
	onExit?: () => void;
}) {
	const { onRender, onKeyPress, onExit } = options;

	return {
		render: onRender,
		handleKey: onKeyPress,
		exit: onExit || (() => {}),
	};
}

// Fuzzy match function
function fuzzyMatch(text: string, query: string) {
	const queryChars = query.toLowerCase().split("");
	const textLower = text.toLowerCase();

	let lastIndex = -1;
	const matchedIndices: number[] = [];

	for (const char of queryChars) {
		const index = textLower.indexOf(char, lastIndex + 1);
		if (index === -1) return null;
		matchedIndices.push(index);
		lastIndex = index;
	}

	return {
		score: matchedIndices.length,
		indices: matchedIndices,
	};
}

export async function AutocompletePrompt({
	message,
	choices,
	initialValue = inputConfig.autocomplete.initialValue,
}: {
	message: string;
	choices?: unknown[];
	initialValue?: string;
	options?: { value: unknown; label: string }[];
	limit?: number;
	[key: string]: unknown;
}) {
	let value = initialValue;
	let filteredChoices: { text: string; score: number; indices: number[] }[] = [];
	let selectedIndex = 0;

	return createPrompt({
		message,
		onRender() {
			if (value) {
				const choiceArray = (choices || ([] as unknown[])) as string[];
				filteredChoices = choiceArray
					.map((c: string) => {
						const match = fuzzyMatch(c, value);
						return match ? { text: c, ...match } : null;
					})
					.filter(
						(x): x is { text: string; score: number; indices: number[] } => x !== null,
					)
					.sort(
						(a: { score: number }, b: { score: number }) => b.score - a.score,
					);

				selectedIndex = Math.min(selectedIndex, filteredChoices.length - 1);
			}

			const displayChoices = filteredChoices.length
				? filteredChoices.map(({ text, indices }) => {
					// Highlight matched characters
					let highlighted = "";
					let lastPos = 0;
					indices.forEach((pos: number) => {
						highlighted += text.slice(lastPos, pos) + pc.inverse(text[pos]);
						lastPos = pos + 1;
					});
					highlighted += text.slice(lastPos);
					return highlighted;
				})
				: [pc.dim("No matches found")];

			return [
				`${pc.cyan("?")} ${message} ${pc.dim("(type to filter)")}`,
				`> ${value}`,
				...displayChoices.map((c, i) => i === selectedIndex ? pc.inverse(` ${c} `) : `  ${c}`),
			].join("\n");
		},
		onKeyPress(key) {
			if (key === "ArrowUp" || key === "ctrl+k") {
				selectedIndex = Math.max(0, selectedIndex - 1);
			} else if (key === "ArrowDown" || key === "ctrl+j") {
				selectedIndex = Math.min(filteredChoices.length - 1, selectedIndex + 1);
			} else if (key === "Enter" && filteredChoices.length > 0) {
				value = filteredChoices[selectedIndex]?.text || "";
			} else if (key === "Escape") {
				value = "";
			}
		},
	});
}
