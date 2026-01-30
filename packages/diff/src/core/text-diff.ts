import { lcs } from "../core/lcs";
import { ChangeType } from "../types";

export interface TextDiffLine {
	type: "common" | "added" | "deleted";
	content: string;
	lineNumber?: number;
}

export interface TextDiffOptions {
	ignoreWhitespace?: boolean;
	ignoreCase?: boolean;
	contextLines?: number;
}

export function textDiff(expected: string, actual: string, options: TextDiffOptions = {}): TextDiffLine[] {
	const { ignoreWhitespace = false, ignoreCase = false } = options;

	const expLines = expected.split("\n");
	const actLines = actual.split("\n");

	const processedExp = expLines.map(line => processLine(line, ignoreWhitespace, ignoreCase));
	const processedAct = actLines.map(line => processLine(line, ignoreWhitespace, ignoreCase));

	const changes = lcs(processedExp, processedAct);

	const result: TextDiffLine[] = [];
	let expIndex = 0;
	let actIndex = 0;

	for (const change of changes) {
		while (expIndex < (change.indexA ?? 0)) {
			const line = expLines[expIndex];
			if (line !== undefined) {
				result.push({ type: "deleted", content: line, lineNumber: expIndex + 1 });
			}
			expIndex++;
		}
		while (actIndex < (change.indexB ?? 0)) {
			const line = actLines[actIndex];
			if (line !== undefined) {
				result.push({ type: "added", content: line, lineNumber: actIndex + 1 });
			}
			actIndex++;
		}

		if (change.type === ChangeType.COMMON) {
			const line = expLines[expIndex];
			if (line !== undefined) {
				result.push({ type: "common", content: line });
			}
			expIndex++;
			actIndex++;
		}
	}

	while (expIndex < expLines.length) {
		const line = expLines[expIndex];
		if (line !== undefined) {
			result.push({ type: "deleted", content: line, lineNumber: expIndex + 1 });
		}
		expIndex++;
	}

	while (actIndex < actLines.length) {
		const line = actLines[actIndex];
		if (line !== undefined) {
			result.push({ type: "added", content: line, lineNumber: actIndex + 1 });
		}
		actIndex++;
	}

	return result;
}

function processLine(line: string, ignoreWhitespace: boolean, ignoreCase: boolean): string {
	let processed = line;
	if (ignoreWhitespace) {
		processed = processed.trim();
	}
	if (ignoreCase) {
		processed = processed.toLowerCase();
	}
	return processed;
}

export function formatTextDiff(diff: TextDiffLine[], contextLines = 3): string {
	let result = "";
	let commonCount = 0;

	for (const line of diff) {
		if (line.type === "common") {
			if (commonCount < contextLines) {
				result += `  ${line.content}\n`;
				commonCount++;
			}
		} else {
			commonCount = 0;
			if (line.type === "added") {
				result += `+ ${line.content}\n`;
			} else {
				result += `- ${line.content}\n`;
			}
		}
	}

	return result;
}
