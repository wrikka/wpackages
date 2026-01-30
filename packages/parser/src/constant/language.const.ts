/**
 * Language Constants
 * Immutable language definitions and metadata
 */

export const LANGUAGE_EXTENSIONS = {
	javascript: [".js", ".mjs", ".cjs"],
	typescript: [".ts", ".mts", ".cts"],
	jsx: [".jsx"],
	tsx: [".tsx"],
	json: [".json", ".jsonc"],
	yaml: [".yaml", ".yml"],
	toml: [".toml"],
	markdown: [".md", ".mdx"],
	html: [".html", ".htm"],
	xml: [".xml", ".svg"],
	css: [".css"],
	scss: [".scss"],
	less: [".less"],
} as const;

export const LANGUAGE_CATEGORIES = {
	programming: ["javascript", "typescript", "jsx", "tsx"],
	data: ["json", "yaml", "toml"],
	markup: ["markdown", "html", "xml"],
	style: ["css", "scss", "less"],
} as const;

export const AST_SUPPORTED_LANGUAGES = [
	"javascript",
	"typescript",
	"jsx",
	"tsx",
	"markdown",
	"html",
	"xml",
	"css",
	"scss",
] as const;

export const LANGUAGE_PARSERS = {
	javascript: "oxc",
	typescript: "oxc",
	jsx: "oxc",
	tsx: "oxc",
	json: "native",
	yaml: "yaml",
	toml: "smol-toml",
	markdown: "marked",
	html: "parse5",
	xml: "fast-xml-parser",
	css: "postcss",
	scss: "postcss",
	less: "postcss",
} as const;
