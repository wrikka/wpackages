import { formatChart, formatComparison, formatJson, formatTable } from "../components/index";
import type { ComparisonResult } from "../types/index";

export function formatOutput(
	comparison: ComparisonResult,
	outputType: "json" | "table" | "chart" | "comparison",
): string {
	switch (outputType) {
		case "json":
			return formatJson(comparison);
		case "table":
			return formatTable(comparison);
		case "chart":
			return formatChart(comparison);
		default:
			return formatComparison(comparison);
	}
}
