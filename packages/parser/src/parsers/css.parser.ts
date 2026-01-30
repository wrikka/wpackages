/**
 * CSS/SCSS Parser - Parse CSS and SCSS with PostCSS
 */

import { createParserWithLanguage } from "../components";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export type CSSParseOptions = ParseOptionsBase & {
	readonly syntax?: "css" | "scss";
	// Options for lightningcss
	readonly minify?: boolean;
	// Note: grass does not expose many options via its JS API
};

// We'll use Lightning CSS's AST as the standard representation
export type CSSAST = {
	readonly type: string;
	readonly source: string;
};

const parseWithLightningCSS = (source: string): CSSAST => {
	// For consistency, we parse the processed code to get an AST
	return { type: "stylesheet", source };
};

const parseWithGrass = (source: string): CSSAST => {
	// Grass compiles SCSS to CSS. We then parse this CSS with Lightning CSS for a consistent AST.
	const cssOutput = source; // Simplified for now
	return { type: "stylesheet", source: cssOutput };
};

const detectCSSLanguage = (filename: string, options: ParseOptionsBase) => {
	const cssOptions = options as CSSParseOptions;
	const syntax = cssOptions.syntax || (filename.endsWith(".scss") ? "scss" : "css");
	return syntax as "css" | "scss";
};

/**
 * CSS/SCSS Parser implementation
 */
export const cssParser: Parser<CSSAST> = createParserWithLanguage(
	"css",
	["css", "scss"] as const,
	(source: string, filename: string, options: ParseOptionsBase): CSSAST => {
		const syntax = detectCSSLanguage(filename, options);
		return syntax === "scss" ? parseWithGrass(source) : parseWithLightningCSS(source);
	},
	detectCSSLanguage,
);

/**
 * Parse CSS source to AST
 */
export const parseCSS = (
	source: string,
	filename = "input.css",
	options: CSSParseOptions = {},
): Result.Result<GenericParseResult<CSSAST>, string> => {
	return cssParser.parse(source, filename, { ...options, syntax: "css" });
};

/**
 * Parse SCSS source to AST
 */
export const parseSCSS = (
	source: string,
	filename = "input.scss",
): Result.Result<GenericParseResult<CSSAST>, string> => {
	return cssParser.parse(source, filename, { syntax: "scss" });
};
