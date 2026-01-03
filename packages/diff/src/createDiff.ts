import { diff, type DiffResult } from "./diff";

const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const red = (str: string) => `\x1b[31m${str}\x1b[0m`;

function format(value: unknown): string {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

function formatStructuredDiff(diffResult: DiffResult, indent = 2): string {
	let result = "";
	const indentation = " ".repeat(indent);

	for (const key of Object.keys(diffResult.deleted).sort()) {
		result += `\n${indentation}${green(`- ${key}: ${format(diffResult.deleted[key])}`)}`;
	}

	for (const key of Object.keys(diffResult.added).sort()) {
		result += `\n${indentation}${red(`+ ${key}: ${format(diffResult.added[key])}`)}`;
	}

	for (const key of Object.keys(diffResult.updated).sort()) {
		const value = diffResult.updated[key];
		if (value && typeof value === "object" && "__old" in value && "__new" in value) {
			result += `\n${indentation}${green(`- ${key}: ${format(value.__old)}`)}`;
			result += `\n${indentation}${red(`+ ${key}: ${format(value.__new)}`)}`;
		} else {
			const nestedDiff = formatStructuredDiff(value as DiffResult, indent + 2);
			if (nestedDiff) {
				result += `\n${indentation}${key}: {${nestedDiff}\n${indentation}}`;
			}
		}
	}

	return result;
}

export function createDiff(expected: unknown, actual: unknown): string {
	const diffResult = diff(expected, actual);

	if (!diffResult) {
		return "";
	}

	// Handle non-object diffs which are returned in updated.value
	if (diffResult.updated.value) {
		const { __old, __new } = diffResult.updated.value;
		if (typeof __old === "string" && typeof __new === "string") {
			const expLines = __old.split("\n");
			const actLines = __new.split("\n");
			const maxLines = Math.max(expLines.length, actLines.length);
			let diffText = "";

			for (let i = 0; i < maxLines; i++) {
				const expLine = expLines[i];
				const actLine = actLines[i];

				if (expLine !== actLine) {
					if (expLine !== undefined) diffText += `\n${green(`- ${expLine}`)}`;
					if (actLine !== undefined) diffText += `\n${red(`+ ${actLine}`)}`;
				} else {
					diffText += `\n  ${expLine}`;
				}
			}
			return `\n\n${green(`- Expected`)}\n${red(`+ Received`)}${diffText}`;
		}
		return `\n\n${green(`- Expected: ${format(__old)}`)}\n${red(`+ Received: ${format(__new)}`)}`;
	}

	const formattedDiff = formatStructuredDiff(diffResult);
	return formattedDiff ? `\n\n${green(`- Expected`)}\n${red(`+ Received`)}\n\n{${formattedDiff}\n}` : "";
}
