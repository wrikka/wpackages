import { readFileSync } from "node:fs";
import { dirname } from "node:path";

export function getAffectedTests(changedFile: string, testFiles: string[]): string[] {
	const affected = new Set<string>();

	for (const testFile of testFiles) {
		if (isFileAffected(changedFile, testFile)) {
			affected.add(testFile);
		}
	}

	return Array.from(affected);
}

function isFileAffected(changedFile: string, testFile: string): boolean {
	if (changedFile === testFile) {
		return true;
	}

	if (dirname(changedFile) === dirname(testFile)) {
		return true;
	}

	const changedBase = getFileBaseName(changedFile);
	const testContent = tryReadFile(testFile);
	if (testContent && testContent.includes(changedBase)) {
		return true;
	}

	return false;
}

function getFileBaseName(filePath: string): string {
	const base = filePath.split("/").pop() || "";
	return base.split(".").shift() || base;
}

function tryReadFile(filePath: string): string | null {
	try {
		return readFileSync(filePath, "utf8");
	} catch {
		return null;
	}
}
