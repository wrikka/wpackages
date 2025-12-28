/**
 * Interactive Search/Autocomplete
 * Real-time fuzzy search with keyboard navigation
 */

import { emitKeypressEvents } from "node:readline";
import { colors } from "./constants/color.const";
import { SYMBOLS as symbols } from "./constants/symbol.const";
import { fuzzyMatch as fuzzyMatchFn } from "./utils/fuzzy.utils";

/**
 * Interactive search/autocomplete
 */
export async function interactiveSearch<T>(options: {
	readonly message: string;
	readonly options: readonly {
		readonly value: T;
		readonly label: string;
		readonly description?: string;
	}[];
	readonly placeholder?: string;
	readonly maxItems?: number;
}): Promise<T> {
	const maxItems = options.maxItems || 10;
	let query = "";
	let selectedIndex = 0;
	let filtered = options.options.slice(0, maxItems);

	// Setup readline
	if (process.stdin.isTTY) {
		process.stdin.setRawMode(true);
	}
	emitKeypressEvents(process.stdin);

	let isFirstRender = true;

	return new Promise((resolve) => {
		const render = () => {
			if (isFirstRender) {
				isFirstRender = false;
			} else {
				// Move cursor up to redraw (not clear screen)
				const linesToClear = 5 + filtered.length; // header + search + options + help
				process.stdout.write(`\x1b[${linesToClear}A`); // Move up
				process.stdout.write("\x1b[J"); // Clear from cursor down
			}

			// Header
			console.log(`${colors.cyan(symbols.pointer)} ${options.message}`);

			// Search input
			const placeholder = options.placeholder
				? colors.dim(options.placeholder)
				: "";
			const input = query || placeholder;
			console.log(`${colors.dim("  Search:")} ${input}`);
			console.log();

			// Filtered options
			if (filtered.length === 0) {
				console.log(colors.yellow(`  ${symbols.warning} No results`));
			} else {
				filtered.forEach((opt, i) => {
					const isSelected = i === selectedIndex;
					const prefix = isSelected ? colors.cyan(symbols.pointerSmall) : " ";
					const label = isSelected ? colors.bright(opt.label) : opt.label;
					const desc = opt.description
						? colors.dim(` - ${opt.description}`)
						: "";
					console.log(`  ${prefix} ${label}${desc}`);
				});
			}

			// Help
			console.log();
			console.log(colors.dim("  ↑/↓ Navigate • Enter Select • Esc Cancel"));
		};

		const updateFiltered = () => {
			if (!query) {
				filtered = options.options.slice(0, maxItems);
			} else {
				// Fuzzy search
				const scored = options.options
					.map((opt) => ({
						option: opt,
						score: fuzzyMatchFn(query, opt.label),
					}))
					.filter((item) => item.score > 0)
					.sort((a, b) => b.score - a.score)
					.slice(0, maxItems);

				filtered = scored.map((item) => item.option);
			}

			selectedIndex = 0;
		};

		const cleanup = () => {
			if (process.stdin.isTTY) {
				process.stdin.setRawMode(false);
			}
			process.stdin.removeAllListeners("keypress");
		};

		// Initial render
		render();

		// Keypress handler
		process.stdin.on("keypress", (str, key) => {
			if (key.ctrl && key.name === "c") {
				cleanup();
				process.exit(0);
			}

			if (key.name === "escape") {
				cleanup();
				console.clear();
				console.log(colors.yellow(`\n  ${symbols.warning} Cancelled\n`));
				process.exit(0);
			}

			if (key.name === "return") {
				cleanup();
				const selected = filtered[selectedIndex];
				if (!selected) {
					console.clear();
					console.log(colors.yellow(`\n  ${symbols.warning} No selection\n`));
					process.exit(0);
				}
				console.clear();
				console.log(`${colors.cyan(symbols.pointer)} ${options.message}`);
				console.log(colors.dim(`  ${symbols.success} ${selected.label}`));
				console.log();
				resolve(selected.value);
				return;
			}

			if (key.name === "up") {
				selectedIndex = Math.max(0, selectedIndex - 1);
				render();
				return;
			}

			if (key.name === "down") {
				selectedIndex = Math.min(filtered.length - 1, selectedIndex + 1);
				render();
				return;
			}

			if (key.name === "backspace") {
				query = query.slice(0, -1);
				updateFiltered();
				render();
				return;
			}

			if (str && !key.ctrl && !key.meta) {
				query += str;
				updateFiltered();
				render();
				return;
			}
		});
	});
}
