import { COLORS } from "../../constant/cli.const";
import type { BenchmarkResult, ComparisonResult } from "../../types/index";

export const sortByMean = (comparison: ComparisonResult): BenchmarkResult[] => {
	return [...comparison.results].sort((a, b) => a.mean - b.mean);
};

export const formatTableRow = (
	row: readonly string[],
	widths: readonly number[],
	isHeader = false,
): string => {
	const formatted = row.map((cell, i) => cell.padEnd(widths[i] ?? 0)).join(" ");
	return isHeader ? `${COLORS.bold(formatted)}\n` : `${formatted}\n`;
};
