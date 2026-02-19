/**
 * parser - Universal Multi-Language Parser
 *
 * Fast, functional parser supporting multiple languages:
 * - JavaScript/TypeScript/JSX/TSX (powered by OXC)
 * - JSON (native)
 * - YAML
 * - TOML
 * - Markdown (with AST)
 * - HTML (parse5)
 * - XML (fast-xml-parser)
 * - CSS/SCSS (PostCSS)
 *
 * Features:
 * - Auto-detect language from filename
 * - Functional error handling with Result type
 * - Zero configuration needed
 * - Extensible parser registry
 */

// === Universal Parser API (Recommended) ===
export {
	getParser,
	getSupportedLanguages,
	isLanguageSupported,
	parse,
	parseFile,
	parseMultipleFiles,
	registerParser,
} from "./services";

// === Language-Specific Parsers ===
export {
	cssParser,
	htmlParser,
	javascriptParser,
	// Parser instances
	jsonParser,
	markdownParser,
	parseCSS,
	parseDockerfile,
	parseGraphQL,
	parseHTMLSource,
	parseJavaScript,
	parseJSON,
	parseMarkdown,
	parseSCSS,
	parseTOMLSource,
	parseTypeScript,
	parseXML,
	parseYAML_source,
	tomlParser,
	xmlParser,
	yamlParser,
} from "./parsers";

// === Legacy API (Backward Compatibility) ===
export { parseLegacyFile, parseLegacyMultipleFiles, parseSource } from "./services";

// === Low-level libs ===
export { parseWithOXC } from "./lib";
export type { OXCParseOptions } from "./lib";

// === Types ===
// Universal types
export type { GenericParseResult, Language, LanguageCategory, LanguageInfo, ParseOptionsBase, Parser } from "./types";

// Parser-specific types
export type {
	CSSAST,
	CSSParseOptions,
	HTMLAST,
	HTMLParseOptions,
	JavaScriptAST,
	JavaScriptParseOptions,
	JSONParseOptions,
	MarkdownAST,
	MarkdownParseOptions,
	TOMLParseOptions,
	XMLParseOptions,
	YAMLParseOptions,
} from "./parsers";

// Legacy types (backward compatibility)
export type { ParseError, ParseOptions, ParseResult } from "./types";

// === Utilities ===
export {
	// Language detection
	detectLanguage,
	findExportNames,
	findExports,
	// Import/Export utilities
	findImports,
	findImportsFrom,
	findImportSources,
	findNode,
	findNodes,
	findNodesByType,
	getLanguageInfo,
	getLanguagesByCategory,
	hasDefaultExport,
	Result,
	supportsAST,
	// AST utilities
	traverse,
} from "./utils";

export type { ExportInfo, ImportInfo } from "./utils";
