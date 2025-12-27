/**
 * Pure function to render file tree
 */
import * as path from "path";
import type { FileInfo } from "../types";


/**
 * Render file tree as formatted string
 * @param files - Array of file info
 * @param baseDir - Base directory for relative paths
 * @returns Formatted file tree string
 */
export function renderFileTree(files: FileInfo[], baseDir: string): string {
	const lines: string[] = [];

	files.forEach((file, index) => {
		const isLast = index === files.length - 1;
		const prefix = isLast ? "└──" : "├──";
		const relativePath = path.relative(baseDir, file.path);
		lines.push(`   ${prefix} ${relativePath}`);
	});

	return lines.join("\n");
}

/**
 * Render dependencies list as formatted string
 * @param dependencies - Set of dependency names
 * @returns Formatted dependencies string
 */
export function renderDependencies(dependencies: Set<string>): string {
	const lines: string[] = [];
	const depsArray = Array.from(dependencies);

	depsArray.forEach((dep, index) => {
		const isLast = index === depsArray.length - 1;
		const prefix = isLast ? "└──" : "├──";
		lines.push(`   ${prefix} ${dep}`);
	});

	return lines.join("\n");
}

/**
 * Render file list as markdown list
 * @param files - Array of file info
 * @returns Markdown formatted file list
 */
export function renderFileListMarkdown(files: FileInfo[]): string {
	return files.map(f => `- ${path.basename(f.path)}`).join("\n");
}
