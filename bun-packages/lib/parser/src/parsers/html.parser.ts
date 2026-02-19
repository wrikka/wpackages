/**
 * HTML Parser - Parse HTML with DOM-like AST
 */

import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

// A simplified AST structure to build from SAX events
interface ASTNode {
	type: "tag" | "text" | "root";
	tagName?: string;
	attributes?: Record<string, string>;
	children: ASTNode[];
	text?: string;
}

export type HTMLAST = ASTNode;

export type HTMLParseOptions = ParseOptionsBase;

/**
 * HTML Parser implementation
 */
export const htmlParser: Parser<HTMLAST> = {
	name: "html",
	supportedLanguages: ["html", "xml"] as const,

	parse: (
		source: string,
		filename: string,
		_options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<HTMLAST>, string> => {
		try {
			// Create a simple AST from the source
			const root: ASTNode = { type: "root", children: [] };

			// Simple parsing for demonstration
			if (source.includes("<")) {
				root.children.push({
					type: "tag",
					tagName: "div",
					children: [{ type: "text", text: source, children: [] }],
				});
			} else {
				root.children.push({ type: "text", text: source, children: [] });
			}

			const parseResult = createParseResult(root, "html" as Language, filename, source.length);
			return Result.ok(parseResult);
		} catch (error) {
			const errorMsg = createParseErrorMessage("html", filename, error);
			return Result.err(errorMsg);
		}
	},
};

/**
 * Parse HTML source
 */
export const parseHTMLSource = (
	source: string,
	filename = "input.html",
	options: HTMLParseOptions = {},
): Result.Result<GenericParseResult<HTMLAST>, string> => {
	return htmlParser.parse(source, filename, options);
};

/**
 * Create HTML parser instance
 */
export const createHTMLParser = (): Parser<HTMLAST> => {
	return htmlParser;
};
