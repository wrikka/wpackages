import type { FormatResult } from "../types";
import { colors } from "../lib";

export const formatIntro = (message: string): string => {
	return colors.cyan(`✨ ${message}`);
};

export const formatSuccess = (message: string): string => {
	return colors.green(`✅ ${message}`);
};

export const formatError = (message: string): string => {
	return colors.red(`❌ ${message}`);
};

export const formatSpinner = (isCheck: boolean, paths: readonly string[]): string => {
	const action = isCheck ? "Checking" : "Formatting";
	return `${action} ${paths.join(" ")}...`;
};

export const formatResult = (result: FormatResult, isCheck: boolean): string => {
	const action = isCheck ? "checked" : "formatted";
	return `${result.filesFormatted} files ${action}, ${result.filesChecked} files checked`;
};

export const formatOutro = (message: string): string => {
	return colors.green(`${message} ✨`);
};
