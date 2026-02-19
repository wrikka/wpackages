import { readdirSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";

/**
 * Parse glob pattern into segments.
 */
function parseGlob(pattern: string): string[] {
	const segments: string[] = [];
	let currentSegment = "";
	let inBrackets = false;
	let inBraces = false;

	for (let i = 0; i < pattern.length; i++) {
		const char = pattern[i];

		if (char === "[" && !inBraces) {
			inBrackets = true;
			currentSegment += char;
		} else if (char === "]" && inBrackets) {
			inBrackets = false;
			currentSegment += char;
		} else if (char === "{" && !inBrackets) {
			inBraces = true;
			currentSegment += char;
		} else if (char === "}" && inBraces) {
			inBraces = false;
			currentSegment += char;
		} else if (char === "/" && !inBrackets && !inBraces) {
			if (currentSegment) {
				segments.push(currentSegment);
			}
			currentSegment = "";
		} else {
			currentSegment += char;
		}
	}

	if (currentSegment) {
		segments.push(currentSegment);
	}

	return segments;
}

/**
 * Walk directory tree and collect matching files.
 */
function walk(dir: string, segments: string[], currentSegmentIndex: number, files: Record<string, string>): void {
	if (currentSegmentIndex >= segments.length) {
		return;
	}

	const currentSegment = segments[currentSegmentIndex];
	if (!currentSegment) return;

	const isLastSegment = currentSegmentIndex === segments.length - 1;

	if (currentSegment === "**") {
		const entries = readdirSync(dir);
		for (const entry of entries) {
			const fullPath = join(dir, entry);
			const stat = statSync(fullPath);
			if (stat.isDirectory()) {
				walk(fullPath, segments, currentSegmentIndex + 1, files);
			} else if (isLastSegment) {
				files[fullPath] = readFileSync(fullPath, "utf-8");
			}
		}
	} else if (currentSegment.includes("*")) {
		const regex = new RegExp("^" + currentSegment.replace(/\*/g, ".*") + "$");
		const entries = readdirSync(dir);
		for (const entry of entries) {
			if (regex.test(entry)) {
				const fullPath = join(dir, entry);
				const stat = statSync(fullPath);
				if (stat.isDirectory() && !isLastSegment) {
					walk(fullPath, segments, currentSegmentIndex + 1, files);
				} else if (stat.isFile() && isLastSegment) {
					files[fullPath] = readFileSync(fullPath, "utf-8");
				}
			}
		}
	} else {
		const fullPath = join(dir, currentSegment);
		const stat = statSync(fullPath);
		if (stat.isDirectory() && !isLastSegment) {
			walk(fullPath, segments, currentSegmentIndex + 1, files);
		} else if (stat.isFile() && isLastSegment) {
			files[fullPath] = readFileSync(fullPath, "utf-8");
		}
	}
}

/**
 * Embed multiple files matching an enhanced glob pattern at build time.
 * Supports full glob patterns: *, **, ?, [abc], {a,b,c}, !(pattern)
 *
 * @param pattern - Glob pattern to match files
 * @returns An object mapping file paths to their contents
 * @throws Error if files cannot be read
 */
export const embedGlobFull = Bun.macro((pattern: string) => {
	const baseDir = resolve(import.meta.dir, "..");
	const files: Record<string, string> = {};

	try {
		const segments = parseGlob(pattern);
		walk(baseDir, segments, 0, files);
		return JSON.stringify(files);
	} catch (error) {
		throw new Error(
			"Failed to embed glob pattern \"" + pattern + "\": " + (error instanceof Error ? error.message : String(error)),
		);
	}
});
