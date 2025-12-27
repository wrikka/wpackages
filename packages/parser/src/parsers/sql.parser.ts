/**
 * SQL Parser - Parse SQL queries and schemas
 */

import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export type SQLAST = {
	readonly type: string;
	readonly statements?: unknown[];
};

export type SQLParseOptions = ParseOptionsBase;

/**
 * SQL Parser implementation
 */
export const sqlParser: Parser<SQLAST> = {
	name: "sql",
	supportedLanguages: ["sql"] as const,

	parse: (
		source: string,
		filename: string,
		_options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<SQLAST>, string> => {
		try {
			// Simple SQL parsing - extract statements
			const statements: unknown[] = [];

			// Match SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, etc.
			const stmtPattern = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|WITH)\s+/gim;
			let match;

			while ((match = stmtPattern.exec(source)) !== null) {
				statements.push({
					type: match[1]?.toUpperCase() ?? "UNKNOWN",
					start: match.index,
				});
			}

			const ast: SQLAST = {
				type: "Program",
				statements,
			};

			return Result.ok(
				createParseResult(ast, "sql" as Language, filename, source.length),
			);
		} catch (error) {
			return Result.err(createParseErrorMessage("SQL", filename, error));
		}
	},
};

/**
 * Parse SQL source
 */
export const parseSQL = (
	source: string,
	filename = "input.sql",
	options: SQLParseOptions = {},
): Result.Result<GenericParseResult<SQLAST>, string> => {
	return sqlParser.parse(source, filename, options);
};
