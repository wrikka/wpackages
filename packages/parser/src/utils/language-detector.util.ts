/**
 * Language detection utility - Detect language from filename
 */

import type { Language, LanguageInfo } from "../types/language.type";

/**
 * Language information database
 */
const LANGUAGE_DB: readonly LanguageInfo[] = [
	{
		language: "typescript",
		category: "code",
		extensions: [".ts", ".mts", ".cts"],
		supportsAST: true,
	},
	{
		language: "tsx",
		category: "code",
		extensions: [".tsx"],
		supportsAST: true,
	},
	{
		language: "javascript",
		category: "code",
		extensions: [".js", ".mjs", ".cjs"],
		supportsAST: true,
	},
	{
		language: "jsx",
		category: "code",
		extensions: [".jsx"],
		supportsAST: true,
	},
	{
		language: "json",
		category: "data",
		extensions: [".json", ".jsonc", ".json5"],
		supportsAST: false,
	},
	{
		language: "yaml",
		category: "data",
		extensions: [".yaml", ".yml"],
		supportsAST: false,
	},
	{
		language: "toml",
		category: "config",
		extensions: [".toml"],
		supportsAST: false,
	},
	{
		language: "markdown",
		category: "markup",
		extensions: [".md", ".markdown", ".mdx"],
		supportsAST: true,
	},
	{
		language: "html",
		category: "markup",
		extensions: [".html", ".htm"],
		supportsAST: true,
	},
	{
		language: "xml",
		category: "markup",
		extensions: [".xml", ".svg"],
		supportsAST: true,
	},
	{
		language: "css",
		category: "style",
		extensions: [".css"],
		supportsAST: true,
	},
	{
		language: "scss",
		category: "style",
		extensions: [".scss"],
		supportsAST: true,
	},
	{
		language: "less",
		category: "style",
		extensions: [".less"],
		supportsAST: true,
	},
	{
		language: "graphql",
		category: "query",
		extensions: [".graphql", ".gql"],
		supportsAST: true,
	},
	{
		language: "csv",
		category: "data",
		extensions: [".csv"],
		supportsAST: false,
	},
	{
		language: "ini",
		category: "config",
		extensions: [".ini", ".cfg"],
		supportsAST: false,
	},
	{
		language: "sql",
		category: "query",
		extensions: [".sql"],
		supportsAST: true,
	},
	{
		language: "shell",
		category: "code",
		extensions: [".sh"],
		supportsAST: true,
	},
	{
		language: "bash",
		category: "code",
		extensions: [".bash"],
		supportsAST: true,
	},
	{
		language: "python",
		category: "code",
		extensions: [".py", ".pyw"],
		supportsAST: true,
	},
	{
		language: "rust",
		category: "code",
		extensions: [".rs"],
		supportsAST: true,
	},
	{
		language: "go",
		category: "code",
		extensions: [".go"],
		supportsAST: true,
	},
	{
		language: "java",
		category: "code",
		extensions: [".java"],
		supportsAST: true,
	},
	{
		language: "csharp",
		category: "code",
		extensions: [".cs"],
		supportsAST: true,
	},
	{
		language: "php",
		category: "code",
		extensions: [".php"],
		supportsAST: true,
	},
	{
		language: "ruby",
		category: "code",
		extensions: [".rb"],
		supportsAST: true,
	},
] as const;

/**
 * Get file extension from filename
 */
const getExtension = (filename: string): string => {
	const lastDot = filename.lastIndexOf(".");
	return lastDot === -1 ? "" : filename.slice(lastDot).toLowerCase();
};

/**
 * Detect language from filename
 */
export const detectLanguage = (filename: string): Language => {
	const ext = getExtension(filename);
	if (!ext) return "unknown";

	const info = LANGUAGE_DB.find((lang) => lang.extensions.includes(ext));
	return info?.language || "unknown";
};

/**
 * Get language info
 */
export const getLanguageInfo = (
	language: Language,
): LanguageInfo | undefined => {
	return LANGUAGE_DB.find((info) => info.language === language);
};

/**
 * Check if language supports AST parsing
 */
export const supportsAST = (language: Language): boolean => {
	const info = getLanguageInfo(language);
	return info?.supportsAST ?? false;
};

/**
 * Get all supported languages
 */
export const getSupportedLanguages = (): readonly Language[] => {
	return LANGUAGE_DB.map((info) => info.language);
};

/**
 * Get languages by category
 */
export const getLanguagesByCategory = (
	category: LanguageInfo["category"],
): readonly Language[] => {
	return LANGUAGE_DB.filter((info) => info.category === category).map(
		(info) => info.language,
	);
};
