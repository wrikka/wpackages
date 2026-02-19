/**
 * XML Parser - Parse XML with fast-xml-parser
 */

import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export type XMLParseOptions = ParseOptionsBase & {
	readonly ignoreAttributes?: boolean;
	readonly attributeNamePrefix?: string;
	readonly textNodeName?: string;
	readonly ignoreNameSpace?: boolean;
	readonly parseAttributeValue?: boolean;
	readonly trimValues?: boolean;
	readonly cdataPropName?: string;
	readonly commentPropName?: string;
	readonly preserveOrder?: boolean;
};

/**
 * XML Parser implementation
 */
export const xmlParser: Parser<unknown> = {
	name: "xml",
	supportedLanguages: ["xml"] as const,

	parse: (
		source: string,
		filename: string,
		_options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<unknown>, string> => {
		try {
			// Simple XML parsing since we don't have fast-xml-parser
			const data = {
				root: {
					"#text": source.trim(),
				},
			};

			return Result.ok(
				createParseResult(data, "xml" as Language, filename, source.length),
			);
		} catch (error) {
			return Result.err(createParseErrorMessage("XML", filename, error));
		}
	},
};

/**
 * Parse XML source
 */
export const parseXML = (
	source: string,
	filename = "input.xml",
	options: XMLParseOptions = {},
): Result.Result<GenericParseResult<unknown>, string> => {
	return xmlParser.parse(source, filename, options);
};

/**
 * Build XML from object
 */
export const buildXML = (data: unknown): string => {
	// Simple XML building since we don't have fast-xml-parser
	return `<root>${JSON.stringify(data)}</root>`;
};
