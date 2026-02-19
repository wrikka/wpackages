/**
 * Trigger Input Component (Pure Functions)
 * Handles special trigger characters (@, #, /) for contextual suggestions
 */

import { colors } from "../../constant/color.const";
import { SYMBOLS } from "../../constant/symbol.const";

/**
 * Trigger configuration
 */
export interface TriggerConfig<T> {
	readonly char: string;
	readonly label: string;
	readonly options: readonly {
		value: T;
		label: string;
		description?: string;
	}[];
}

/**
 * Detect trigger in input
 */
export const detectTrigger = <T = unknown>(
	input: string,
	triggers: readonly TriggerConfig<T>[],
): { trigger: TriggerConfig<T>; query: string } | null => {
	for (const trigger of triggers) {
		const lastIndex = input.lastIndexOf(trigger.char);
		if (lastIndex !== -1) {
			const beforeTrigger = input.slice(0, lastIndex);
			const afterTrigger = input.slice(lastIndex + 1);

			// Check if trigger is at start or after space
			if (lastIndex === 0 || beforeTrigger[beforeTrigger.length - 1] === " ") {
				// Check if no space after trigger
				if (!afterTrigger.includes(" ")) {
					return {
						trigger,
						query: afterTrigger,
					};
				}
			}
		}
	}
	return null;
};

/**
 * Filter trigger options by query
 */
export const filterTriggerOptions = <T>(
	options: readonly { value: T; label: string; description?: string }[],
	query: string,
): readonly { value: T; label: string; description?: string }[] => {
	if (!query) return options;

	const q = query.toLowerCase();
	return options.filter(
		(opt) =>
			opt.label.toLowerCase().includes(q)
			|| opt.description?.toLowerCase().includes(q),
	);
};

/**
 * Render trigger suggestions popup
 */
export const renderTriggerPopup = <T>(
	trigger: TriggerConfig<T>,
	options: readonly { value: T; label: string; description?: string }[],
	selectedIndex: number,
): string => {
	const lines: string[] = [];

	// Header
	lines.push(colors.dim(`  ${trigger.char} ${trigger.label}`));
	lines.push("");

	// Options
	options.slice(0, 5).forEach((opt, i) => {
		const isSelected = i === selectedIndex;
		const prefix = isSelected ? colors.cyan(SYMBOLS.pointerSmall) : " ";
		const label = isSelected ? colors.bright(opt.label) : opt.label;
		const desc = opt.description ? colors.dim(` - ${opt.description}`) : "";
		lines.push(`  ${prefix} ${label}${desc}`);
	});

	if (options.length > 5) {
		lines.push(colors.dim(`  ... ${options.length - 5} more`));
	}

	return lines.join("\n");
};

/**
 * Insert selected value into input
 */
export const insertTriggerValue = (
	input: string,
	triggerChar: string,
	value: string,
): string => {
	const lastIndex = input.lastIndexOf(triggerChar);
	if (lastIndex === -1) return input;

	const before = input.slice(0, lastIndex);
	return `${before}${value} `;
};
