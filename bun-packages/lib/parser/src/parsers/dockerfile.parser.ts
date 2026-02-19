/**
 * Dockerfile Parser - Parse Docker container definitions
 */

import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export interface DockerfileInstruction {
	readonly type: string;
	readonly value: string;
}

export type DockerfileAST = {
	readonly type: string;
	readonly instructions?: DockerfileInstruction[];
};

export type DockerfileParseOptions = ParseOptionsBase;

/**
 * Dockerfile Parser implementation
 */
export const dockerfileParser: Parser<DockerfileAST> = {
	name: "dockerfile",
	supportedLanguages: ["dockerfile"] as const,

	parse: (
		source: string,
		filename: string,
		_options: ParseOptionsBase = {},
	): Result.Result<GenericParseResult<DockerfileAST>, string> => {
		try {
			// Parse Dockerfile instructions
			const instructions: DockerfileInstruction[] = [];
			const lines = source.split("\n");

			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed && !trimmed.startsWith("#")) {
					const match =
						/^(FROM|RUN|CMD|ENTRYPOINT|WORKDIR|COPY|ADD|ENV|EXPOSE|VOLUME|USER|LABEL|ARG|HEALTHCHECK|SHELL|STOPSIGNAL)\s+/i
							.exec(trimmed);
					if (match && match[1]) {
						instructions.push({
							type: match[1].toUpperCase(),
							value: trimmed.substring(match[0].length),
						});
					}
				}
			}

			const ast: DockerfileAST = {
				type: "Dockerfile",
				instructions,
			};

			return Result.ok(
				createParseResult(ast, "dockerfile" as Language, filename, source.length, [], {
					instructionCount: instructions.length,
				}),
			);
		} catch (error) {
			return Result.err(createParseErrorMessage("Dockerfile", filename, error));
		}
	},
};

/**
 * Parse Dockerfile
 */
export const parseDockerfile = (
	source: string,
	filename = "Dockerfile",
	options: DockerfileParseOptions = {},
): Result.Result<GenericParseResult<DockerfileAST>, string> => {
	return dockerfileParser.parse(source, filename, options);
};
