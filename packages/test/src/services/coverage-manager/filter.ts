import path from "node:path";

function matchesPattern(filePath: string, pattern: string): boolean {
	const regex = new RegExp(
		pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]"),
	);
	return regex.test(filePath);
}

export function shouldIncludeFile(
	filePath: string,
	cwd: string,
	includePatterns: string[],
	excludePatterns: string[],
): boolean {
	const relativePath = path.relative(cwd, filePath);

	for (const pattern of excludePatterns) {
		if (matchesPattern(relativePath, pattern)) {
			return false;
		}
	}

	if (includePatterns.length > 0) {
		for (const pattern of includePatterns) {
			if (matchesPattern(relativePath, pattern)) {
				return true;
			}
		}
		return false;
	}

	return true;
}
