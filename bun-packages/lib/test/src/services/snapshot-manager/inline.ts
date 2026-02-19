import { readFileSync, writeFileSync } from "node:fs";

export function updateInlineSnapshotInFile(params: {
	testFile: string;
	testName: string;
	newValue: string;
}): string {
	const content = readFileSync(params.testFile, "utf8");
	const lines = content.split("\n");

	let inTest = false;
	let snapshotLine = -1;
	let indentLevel = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.includes("it(") || line.includes("test(")) {
			if (line.includes(`"${params.testName}"`) || line.includes(`'${params.testName}'`) || line.includes(`\`${params.testName}\``)) {
				inTest = true;
				indentLevel = line.match(/^(\s*)/)?.[1]?.length || 0;
				continue;
			}
		}

		if (inTest && line.includes("});")) {
			break;
		}

		if (inTest && line.includes("toMatchInlineSnapshot(")) {
			snapshotLine = i;
			break;
		}
	}

	if (snapshotLine === -1) {
		throw new Error(`Could not find inline snapshot for test "${params.testName}"`);
	}

	const indent = " ".repeat(indentLevel + 2);
	lines[snapshotLine] = `${indent}.toMatchInlineSnapshot(${JSON.stringify(params.newValue)});`;

	const updatedContent = lines.join("\n");
	writeFileSync(params.testFile, updatedContent, "utf8");

	return updatedContent;
}
