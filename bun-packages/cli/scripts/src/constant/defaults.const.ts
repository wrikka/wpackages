import type { ScriptRunnerConfig } from "../types";

/**
 * Default script runner configuration
 */
const defaultConfig = {
	scripts: {},
	parallel: false,
	cwd: process.cwd(),
	env: {} as Record<string, string>,
} satisfies ScriptRunnerConfig;

export const DEFAULT_SCRIPT_RUNNER_CONFIG = Object.freeze(defaultConfig);

/**
 * Default script configuration
 */
const defaultScript = {
	name: "",
	command: "",
	parallel: false,
} as const;

export const DEFAULT_SCRIPT = Object.freeze(defaultScript);
