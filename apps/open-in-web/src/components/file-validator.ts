import { ERROR_MESSAGES, FILE_EXTENSIONS } from "../constant";

/**
 * Validates if file is HTML format
 * @param filePath - File path to validate
 * @returns Validated file path
 * @throws Error if not HTML file
 */
export function validateHtmlFile(filePath: string): string {
	if (!filePath.endsWith(FILE_EXTENSIONS.html)) {
		throw new Error(ERROR_MESSAGES.invalidHtml);
	}
	return filePath;
}

/**
 * Validates if file is Markdown format
 * @param filePath - File path to validate
 * @returns Validated file path
 * @throws Error if not Markdown file
 */
export function validateMarkdownFile(filePath: string): string {
	if (!FILE_EXTENSIONS.markdown.some((ext) => filePath.endsWith(ext))) {
		throw new Error(ERROR_MESSAGES.invalidMarkdown);
	}
	return filePath;
}

/**
 * Validates if file is TypeScript format
 * @param filePath - File path to validate
 * @returns Validated file path
 * @throws Error if not TypeScript file
 */
export function validateTsFile(filePath: string): string {
	if (!filePath.endsWith(FILE_EXTENSIONS.typescript)) {
		throw new Error(ERROR_MESSAGES.invalidTs);
	}
	return filePath;
}

/**
 * Validates if URL is valid
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * Extracts filename from file path
 * @param filePath - Full file path
 * @returns Filename only
 */
export function getFileName(filePath: string): string {
	return filePath.split(/[\\/]/).pop() ?? filePath;
}
