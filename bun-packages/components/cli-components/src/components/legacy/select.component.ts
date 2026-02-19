/**
 * Select Component (Pure Function)
 * Renders selection prompt - no side effects
 */

import { colors } from "../../constant/color.const";
import { SYMBOLS } from "../../constant/symbol.const";
import type { SelectOption } from "../../types";

/**
 * Render select option
 */
export const renderSelectOption = <T>(
	option: SelectOption<T>,
	isSelected: boolean,
): string => {
	const prefix = isSelected ? colors.cyan(SYMBOLS.pointerSmall) : " ";
	const label = isSelected ? colors.bright(option.label) : option.label;
	const desc = option.description ? colors.dim(` - ${option.description}`) : "";
	return `  ${prefix} ${label}${desc}`;
};

/**
 * Render multiple select options
 */
export const renderSelectOptions = <T>(
	options: readonly SelectOption<T>[],
	selectedIndex: number,
): string =>
	options
		.map((opt, i) => renderSelectOption(opt, i === selectedIndex))
		.join("\n");

/**
 * Render select with header
 */
export const renderSelect = <T>(
	message: string,
	options: readonly SelectOption<T>[],
	selectedIndex: number,
): string => {
	const header = `${colors.cyan(SYMBOLS.pointer)} ${message}\n`;
	const optionsList = renderSelectOptions(options, selectedIndex);
	return header + optionsList;
};
