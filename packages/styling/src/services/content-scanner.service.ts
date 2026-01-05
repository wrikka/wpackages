import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { join } from "node:path";
import { extractClasses } from "./class-extractor.service";

export interface ScanContentOptions {
	readonly patterns: readonly string[];
	readonly cwd: string;
}

export async function collectFiles(patterns: readonly string[], cwd: string): Promise<string[]> {
	const filePromises = patterns.map(async pattern => {
		const matches: string[] = [];
		for await (const file of glob(pattern, { cwd })) {
			const absPath = join(cwd, file);
			if (absPath.includes("node_modules") || absPath.includes("dist")) {
				continue;
			}

			matches.push(absPath);
		}
		return matches;
	});

	const fileArrays = await Promise.all(filePromises);
	return fileArrays.flat();
}

export async function collectClassesFromContent(options: ScanContentOptions): Promise<Set<string>> {
	const classes = new Set<string>();
	const files = await collectFiles(options.patterns, options.cwd);

	await Promise.all(
		files.map(async filePath => {
			try {
				const code = await readFile(filePath, "utf-8");
				for (const cls of extractClasses(code)) {
					classes.add(cls);
				}
			} catch {
				// ignore unreadable files
			}
		}),
	);

	return classes;
}
