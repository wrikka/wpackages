/**
 * GraphQL Parser - Parse GraphQL queries, mutations, and schemas
 */

import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export interface GraphQLDefinition {
	readonly type: string;
	readonly start: number;
}

export type GraphQLAST = {
	readonly type: string;
	readonly definitions?: GraphQLDefinition[];
};

export type GraphQLParseOptions = ParseOptionsBase;

/**
 * GraphQL Parser implementation
 */
export const graphqlParser: Parser<GraphQLAST> = {
	name: "graphql",
	supportedLanguages: ["graphql"] as const,

	parse: (
		source: string,
		filename: string,
		_options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<GraphQLAST>, string> => {
		try {
			// Simple GraphQL parsing - extract definitions
			const definitions: GraphQLDefinition[] = [];

			// Match query, mutation, subscription, fragment, schema, type, interface, etc.
			const defPattern =
				/^\s*(query|mutation|subscription|fragment|schema|type|interface|union|enum|input|scalar|directive|extend)\s+/gm;
			let match;

			while ((match = defPattern.exec(source)) !== null) {
				if (match && match[1]) {
					definitions.push({
						type: match[1],
						start: match.index,
					});
				}
			}

			const ast: GraphQLAST = {
				type: "Document",
				definitions,
			};

			return Result.ok(
				createParseResult(ast, "graphql" as Language, filename, source.length),
			);
		} catch (error) {
			return Result.err(createParseErrorMessage("GraphQL", filename, error));
		}
	},
};

/**
 * Parse GraphQL source
 */
export const parseGraphQL = (
	source: string,
	filename = "input.graphql",
	options: GraphQLParseOptions = {},
): Result.Result<GenericParseResult<GraphQLAST>, string> => {
	return graphqlParser.parse(source, filename, options);
};
