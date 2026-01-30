/**
 * Confirm Component (Pure Function)
 * Renders confirmation prompt
 */

import { colors } from "../../constant/color.const";
import { SYMBOLS } from "../../constant/symbol.const";

/**
 * Render confirm prompt
 */
export const renderConfirm = (
	message: string,
	defaultValue = false,
): string => {
	const suffix = defaultValue ? colors.dim("(Y/n)") : colors.dim("(y/N)");
	return `${colors.cyan(SYMBOLS.pointer)} ${message} ${suffix}`;
};

/**
 * Render confirm result
 */
export const renderConfirmResult = (value: boolean): string => {
	const display = value ? colors.green("Yes") : colors.yellow("No");
	return colors.dim(`  ${SYMBOLS.success} ${display}`);
};
