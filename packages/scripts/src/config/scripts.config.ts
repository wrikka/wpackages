import type { EnvSchema } from "config-manager";
import type { ScriptRunnerConfig } from "../types";

/**
 * Script runner configuration schema for validation
 */
export const scriptRunnerConfigSchema: EnvSchema<ScriptRunnerConfig> = {
	scripts: {
		type: "json",
		description: "Scripts configuration object",
	},
	parallel: {
		type: "boolean",
		default: false,
		description: "Run scripts in parallel",
	},
	cwd: {
		type: "string",
		description: "Current working directory",
	},
	env: {
		type: "json",
		description: "Environment variables",
	},
};

/**
 * Create script runner configuration with defaults
 */
export const createScriptRunnerConfig = (
	options: Partial<ScriptRunnerConfig> = {},
): ScriptRunnerConfig => ({
	scripts: options.scripts || {},
	parallel: options.parallel ?? false,
	cwd: options.cwd || process.cwd(),
	env: options.env || (process.env as Record<string, string>),
});
