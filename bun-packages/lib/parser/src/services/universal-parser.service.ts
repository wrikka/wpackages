/**
 * Universal Parser Service - Auto-detect language and parse accordingly
 */

import type { GenericParseResult, ParseOptionsBase } from "../types";
import type { Language } from "../types/language.type";
import type { Parser } from "../types/parser-base.type";
import { Result } from "../utils";
import { detectLanguage } from "../utils/language-detector.util";

// Import all parsers
import { cssParser } from "../parsers/css.parser";
import { dockerfileParser } from "../parsers/dockerfile.parser";
import { graphqlParser } from "../parsers/graphql.parser";
import { htmlParser } from "../parsers/html.parser";
import { javascriptParser } from "../parsers/javascript.parser";
import { jsonParser } from "../parsers/json.parser";
import { markdownParser } from "../parsers/markdown.parser";
import { sqlParser } from "../parsers/sql.parser";
import { tomlParser } from "../parsers/toml.parser";
import { xmlParser } from "../parsers/xml.parser";
import { yamlParser } from "../parsers/yaml.parser";

// Registry of all available parsers
const PARSER_REGISTRY = new Map<Language, Parser>([
	["css", cssParser],
	["scss", cssParser],
	["dockerfile", dockerfileParser],
	["graphql", graphqlParser],
	["html", htmlParser],
	["javascript", javascriptParser],
	["jsx", javascriptParser],
	["typescript", javascriptParser],
	["tsx", javascriptParser],
	["json", jsonParser],
	["markdown", markdownParser],
	["sql", sqlParser],
	["toml", tomlParser],
	["xml", xmlParser],
	["yaml", yamlParser],
]);

/**
 * Get parser for a specific language
 */
let parsersInitialized: Promise<void> | null = null;

export const initializeAsyncParsers = () => {
	if (!parsersInitialized) {
		const initPromises: Promise<void>[] = [];
		for (const parser of PARSER_REGISTRY.values()) {
			// Check if parser has initialize method (async parsers)
			if ("initialize" in parser && typeof parser.initialize === "function") {
				initPromises.push(parser.initialize());
			}
		}
		parsersInitialized = Promise.all(initPromises).then(() => undefined);
	}
	return parsersInitialized;
};

export const getParser = (language: Language): Parser | undefined => {
	return PARSER_REGISTRY.get(language);
};

/**
 * Register a custom parser
 */
export const registerParser = (language: Language, parser: Parser): void => {
	PARSER_REGISTRY.set(language, parser);
};

/**
 * Universal parse function - Auto-detects language and parses accordingly
 */
export const parse = async (
	source: string,
	filename: string,
	options: ParseOptionsBase = {},
): Promise<Result.Result<GenericParseResult, string>> => {
	// Detect language from filename or use provided language
	const language = options.language ?? detectLanguage(filename);

	if (language === "unknown") {
		return Result.err(
			`Unable to detect language for file: ${filename}. Please specify language in options.`,
		);
	}

	// Get appropriate parser
	const parser = getParser(language);

	if (!parser) {
		return Result.err(
			`No parser available for language: ${language}. Supported languages: ${
				Array.from(PARSER_REGISTRY.keys()).join(", ")
			}`,
		);
	}

	// Ensure all async parsers are initialized before proceeding.
	await initializeAsyncParsers();

	// Parse using the appropriate parser
	// For now, we'll assume all parsers are synchronous since we removed async support
	const result = parser.parse(source, filename, options);
	return Promise.resolve(result);
};

/**
 * Parse file from disk with auto-detection
 */
export const parseFile = async (
	filePath: string,
	options: ParseOptionsBase = {},
): Promise<Result.Result<GenericParseResult, string>> => {
	try {
		const source = await Bun.file(filePath).text();
		const filename = filePath.split(/[/\\]/).pop() || filePath;

		return await parse(source, filename, options);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to read file";
		return Result.err(`File read error for ${filePath}: ${message}`);
	}
};

/**
 * Parse multiple files concurrently
 */
export const parseMultipleFiles = async (
	filePaths: readonly string[],
	options: ParseOptionsBase = {},
): Promise<readonly Result.Result<GenericParseResult, string>[]> => {
	return Promise.all(filePaths.map((path) => parseFile(path, options)));
};

/**
 * Get all supported languages
 */
export const getSupportedLanguages = (): Language[] => {
	return Array.from(PARSER_REGISTRY.keys());
};

/**
 * Check if a language is supported
 */
export const isLanguageSupported = (language: Language): boolean => {
	return PARSER_REGISTRY.has(language);
};
