/**
 * JavaScript/TypeScript Parser - Parse using OXC (fastest JS/TS parser)
 */

// import { print } from "oxc-printer";
import { parseSync } from "oxc-parser";
import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { ParseError } from "../types/parse-error.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export type JavaScriptParseOptions = ParseOptionsBase & {
	readonly sourceType?: "module" | "script";
	readonly typescript?: boolean;
	readonly jsx?: boolean;
};

export type JavaScriptAST = {
	readonly program: unknown;
	readonly comments?: unknown[];
};

/**
 * JavaScript/TypeScript Parser implementation
 */
export const javascriptParser: Parser<JavaScriptAST, JavaScriptParseOptions> = {
	name: "javascript",
	supportedLanguages: ["javascript", "typescript", "jsx", "tsx"] as const,

	parse: (
		source: string,
		filename: string,
		options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<JavaScriptAST>, string> => {
		const jsOptions = options as JavaScriptParseOptions;
		const { sourceType = "module" } = jsOptions;

		try {
			const language = detectJSLanguage(filename, jsOptions);
			const result = parseSync(
				source,
				JSON.stringify({
					sourceType,
					typescript: jsOptions.typescript ?? false,
					jsx: jsOptions.jsx ?? false,
				}),
			);

			const errors: ParseError[] = result.errors.map((e: { message: string }) => ({
				message: e.message,
				line: 0, // Placeholder, OXC error format needs investigation
				column: 0, // Placeholder
			}));

			return Result.ok(
				createParseResult(
					{
						program: result.program,
						comments: result.comments,
					},
					language,
					filename,
					source.length,
					errors,
					{
						sourceType,
						typescript: jsOptions.typescript,
						jsx: jsOptions.jsx,
					},
				),
			);
		} catch (error: unknown) {
			return Result.err(createParseErrorMessage("JavaScript", filename, error));
		}
	},
	// stringify: (ast: JavaScriptAST, _options = {}): string => {
	// 	const { code } = print(ast.program as any);
	// 	return code;
	// },
};

/**
 * Detect JavaScript language variant
 */
const detectJSLanguage = (
	_filename: string,
	options: JavaScriptParseOptions,
): Language => {
	if (options.typescript) {
		return options.jsx ? "tsx" : "typescript";
	}
	return options.jsx ? "jsx" : "javascript";
};

/**
 * Parse JavaScript source
 */
export const parseJavaScript = (
	source: string,
	filename = "input.js",
	options: JavaScriptParseOptions = {},
): Result.Result<GenericParseResult<JavaScriptAST>, string> => {
	return javascriptParser.parse(source, filename, options);
};

/**
 * Parse TypeScript source
 */
export const parseTypeScript = (
	source: string,
	filename = "input.ts",
	options: Omit<JavaScriptParseOptions, "typescript"> = {},
): Result.Result<GenericParseResult<JavaScriptAST>, string> => {
	return javascriptParser.parse(source, filename, {
		...options,
		typescript: true,
	});
};
