/**
 * Services barrel export
 */

export * from "./cli.service";
export * from "./console.service";
export * from "./file-finder.service";
export * from "./file-system.service";
export * from "./linter.service";
export * from "./parser.service";
export * from "./reporter.service";

import { lint, lintWithDefaults } from "../app";

/**
 * The main service for running the linter.
 */
export const LintService = {
	lint,
	lintWithDefaults,
};
