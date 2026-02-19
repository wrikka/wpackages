import { colors } from "../constant/color.const";
import { SYMBOLS as symbols } from "../constant/symbol.const";
import type { SearchState } from "./state";
import type { SearchOptions } from "./types";

export function render<T>(
	state: SearchState<T>,
	options: SearchOptions<T>,
) {
	if (!state.isFirstRender) {
		const linesToClear = 5 + state.filtered.length; // header + search + options + help
		process.stdout.write(`\x1b[${linesToClear}A`); // Move up
		process.stdout.write("\x1b[J"); // Clear from cursor down
	}

	// Header
	console.log(`${colors.cyan(symbols.pointer)} ${options.message}`);

	// Search input
	const placeholder = options.placeholder
		? colors.dim(options.placeholder)
		: "";
	const input = state.query || placeholder;
	console.log(`${colors.dim("  Search:")} ${input}`);
	console.log();

	// Filtered options
	if (state.filtered.length === 0) {
		console.log(colors.yellow(`  ${symbols.warning} No results`));
	} else {
		state.filtered.forEach((opt, i) => {
			const isSelected = i === state.selectedIndex;
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
}
