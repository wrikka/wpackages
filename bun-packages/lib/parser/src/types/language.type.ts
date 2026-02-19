/**
 * Supported programming languages and file formats
 */

export type Language =
	| "javascript"
	| "typescript"
	| "jsx"
	| "tsx"
	| "json"
	| "yaml"
	| "toml"
	| "markdown"
	| "html"
	| "xml"
	| "css"
	| "scss"
	| "less"
	| "graphql"
	| "sql"
	| "dockerfile"
	| "csv"
	| "ini"
	| "shell"
	| "bash"
	| "python"
	| "rust"
	| "go"
	| "java"
	| "csharp"
	| "php"
	| "ruby"
	| "unknown";

/**
 * Language categories for parser selection
 */
export type LanguageCategory =
	| "code" // Programming languages with AST
	| "data" // Data formats (JSON, YAML, etc.)
	| "markup" // Markup languages (HTML, XML, Markdown)
	| "style" // Styling languages (CSS, SCSS)
	| "query" // Query languages (SQL, GraphQL)
	| "config" // Configuration files
	| "text"; // Plain text or unknown

export type LanguageInfo = {
	readonly language: Language;
	readonly category: LanguageCategory;
	readonly extensions: readonly string[];
	readonly supportsAST: boolean;
};
