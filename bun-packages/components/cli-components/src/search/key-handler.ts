import { colors } from "../constant/color.const";
import { SYMBOLS as symbols } from "../constant/symbol.const";
import { updateFiltered } from "./filter";
import { render } from "./renderer";
import type { SearchState } from "./state";
import type { SearchOptions } from "./types";

export function handleKeyPress<T>(
	str: string,
	key: { name: string; ctrl: boolean; meta: boolean },
	state: SearchState<T>,
	options: SearchOptions<T>,
	resolve: (value: T) => void,
	cleanup: () => void,
) {
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
		const selected = state.filtered[state.selectedIndex];
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
		state.selectedIndex = Math.max(0, state.selectedIndex - 1);
		render(state, options);
		return;
	}

	if (key.name === "down") {
		state.selectedIndex = Math.min(state.filtered.length - 1, state.selectedIndex + 1);
		render(state, options);
		return;
	}

	if (key.name === "backspace") {
		state.query = state.query.slice(0, -1);
		state.filtered = updateFiltered(state.query, options.options, options.maxItems || 10);
		state.selectedIndex = 0;
		render(state, options);
		return;
	}

	if (str && !key.ctrl && !key.meta) {
		state.query += str;
		state.filtered = updateFiltered(state.query, options.options, options.maxItems || 10);
		state.selectedIndex = 0;
		render(state, options);
		return;
	}
}
