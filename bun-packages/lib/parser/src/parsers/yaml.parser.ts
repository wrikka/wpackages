/**
 * YAML Parser - Parse YAML files with enhanced error handling using js-yaml
 */

import * as yaml from "js-yaml";
import { createParseErrorMessage, createParseResult } from "../components";
import type { Language } from "../types/language.type";
import type { GenericParseResult, ParseOptionsBase, Parser } from "../types/parser-base.type";
import { Result } from "../utils";

export type YAMLParseOptions = ParseOptionsBase & {
	readonly strict?: boolean;
	readonly schema?: "core" | "failsafe" | "json" | "yaml-1.1";
};

const mapSchema = (schema?: "core" | "failsafe" | "json" | "yaml-1.1"): yaml.Schema => {
	switch (schema) {
		case "core":
			return yaml.CORE_SCHEMA;
		case "failsafe":
			return yaml.FAILSAFE_SCHEMA;
		case "json":
			return yaml.JSON_SCHEMA;
		case "yaml-1.1":
			return yaml.DEFAULT_SCHEMA; // Mapped to default for broader compatibility
		default:
			return yaml.DEFAULT_SCHEMA;
	}
};

/**
 * YAML Parser implementation
 */
export const yamlParser: Parser<unknown> = {
	name: "yaml",
	supportedLanguages: ["yaml"] as const,

	parse: (
		source: string,
		filename: string,
		options: YAMLParseOptions = {},
	): Result.Result<GenericParseResult<unknown>, string> => {
		try {
			const data = yaml.load(source, {
				filename,
				json: options.schema === "json",
				schema: mapSchema(options.schema),
			});

			return Result.ok(
				createParseResult(data, "yaml" as Language, filename, source.length),
			);
		} catch (error) {
			return Result.err(createParseErrorMessage("YAML", filename, error));
		}
	},
};

/**
 * Parse YAML source
 */
export const parseYAML_source = (
	source: string,
	filename = "input.yaml",
	options: YAMLParseOptions = {},
): Result.Result<GenericParseResult<unknown>, string> => {
	return yamlParser.parse(source, filename, options);
};

/**
 * Stringify YAML data
 */
export const stringifyYAML = (data: unknown): string => {
	return yaml.dump(data);
};
