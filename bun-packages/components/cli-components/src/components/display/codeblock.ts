import pc from "picocolors";
import { displayConfig } from "../../config/display.config";

export function CodeBlock({
	code,
	_language,
	showLineNumbers = displayConfig.codeblock.showLineNumbers,
	highlightLines = [],
}: {
	code: string;
	_language?: string;
	showLineNumbers?: boolean;
	highlightLines?: number[];
}): string {
	// _language parameter is kept for API compatibility but not used in simple rendering
	void _language; // Suppress unused variable warning
	const lines = code.split("\n");
	const maxLength = Math.max(...lines.map((line) => line.length));

	// Simple syntax highlighting without external dependency
	const highlightedLines = lines.map((line) => pc.cyan(line));

	const border = pc.gray(`┌${"─".repeat(maxLength + 2)}┐`);
	const bottomBorder = pc.gray(`└${"─".repeat(maxLength + 2)}┘`);

	return [
		border,
		...highlightedLines.map((line: string, i: number) => {
			const lineNum = showLineNumbers ? pc.dim(`${i + 1} │ `) : "";
			const isHighlighted = highlightLines.includes(i + 1);
			const lineContent = isHighlighted ? pc.bgBlue(line) : line;
			return (
				pc.gray("│ ")
				+ lineNum
				+ lineContent
				+ " ".repeat(maxLength - line.length)
				+ pc.gray(" │")
			);
		}),
		bottomBorder,
		pc.dim("(Press Ctrl+C to copy)"),
	].join("\n");
}
