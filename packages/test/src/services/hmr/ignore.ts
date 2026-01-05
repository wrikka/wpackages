import { extname, relative } from "node:path";

export function compileIgnorePatterns(patterns: string[]): RegExp[] {
	return patterns.map((pattern) =>
		new RegExp(
			pattern
				.replace(/\*\*/g, ".*")
				.replace(/\*/g, "[^/]*")
				.replace(/\?/g, "[^/]"),
		)
	);
}

export function shouldIgnoreFile(options: {
	cwd: string;
	filePath: string;
	ignoreRegexes: RegExp[];
	extensions: string[];
}): boolean {
	const rel = relative(options.cwd, options.filePath);

	for (const regex of options.ignoreRegexes) {
		if (regex.test(rel)) {
			return true;
		}
	}

	const ext = extname(options.filePath);
	return !options.extensions.includes(ext);
}
