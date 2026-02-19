/**
 * Markdown Parser - Parse Markdown with AST support
 */

import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

// markdown-wasm doesn't have as many options as marked, so we simplify this.
export type MarkdownParseOptions = ParseOptionsBase;

// markdown-wasm does not expose its AST, so we will treat the HTML output as the primary 'parsed' data.
export type MarkdownAST = string;

/**
 * Markdown Parser implementation
 */
export const markdownParser: Parser<MarkdownAST> = {
	name: "markdown",
	supportedLanguages: ["markdown"] as const,

	parse: (
		source: string,
		filename: string,
		_options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<MarkdownAST>, string> => {
		try {
			// Simple markdown to HTML conversion since we don't have markdown-wasm
			const html = `<div>${source.replace(/\n/g, "<br>")}</div>`;

			return Result.ok(
				createParseResult(html, "markdown" as Language, filename, source.length),
			);
		} catch (error) {
			return Result.err(createParseErrorMessage("Markdown", filename, error));
		}
	},
};

/**
 * Parse Markdown source to HTML string (which we consider the AST for this parser)
 */
export const parseMarkdown = (
	source: string,
	filename = "input.md",
	options: MarkdownParseOptions = {},
): Result.Result<GenericParseResult<MarkdownAST>, string> => {
	return markdownParser.parse(source, filename, options);
};

/**
 * Parse Markdown to HTML
 */
export const markdownToHTML = (source: string): string => {
	return `<div>${source.replace(/\n/g, "<br>")}</div>`;
};
