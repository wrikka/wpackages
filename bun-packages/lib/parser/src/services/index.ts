/**
 * Services barrel export
 */

// Legacy services (backward compatibility)
export { parseFile as parseLegacyFile, parseMultipleFiles as parseLegacyMultipleFiles } from "./parse-file.service";
export { parseSource } from "./parse-source.service";

// New universal parser services
export {
	getParser,
	getSupportedLanguages,
	isLanguageSupported,
	parse,
	parseFile,
	parseMultipleFiles,
	registerParser,
} from "./universal-parser.service";
