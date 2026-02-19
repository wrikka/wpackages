/**
 * SQL Parser - Parse SQL queries and schemas using sql-parser-cst
 */

import { parse } from "sql-parser-cst";
import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

const SQL_DIALECTS = ["mysql", "sqlite", "mariadb", "bigquery", "postgresql"] as const;
type SQLDialect = (typeof SQL_DIALECTS)[number];

const isSQLDialect = (value: unknown): value is SQLDialect =>
	typeof value === "string" && (SQL_DIALECTS as readonly string[]).includes(value);

// The AST is the CST from sql-parser-cst
export type SQLAST = unknown;

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
			const dialect = isSQLDialect(_options["dialect"]) ? _options["dialect"] : "mysql";
			const ast = parse(source, { dialect });

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
