import type { LangKey } from "../types/cli.type";

export const DEFAULT_GLOBS_BY_LANG: Record<LangKey, readonly string[]> = {
	typescript: ["**/*.ts", "**/*.mts", "**/*.cts"],
	tsx: ["**/*.tsx"],
	javascript: ["**/*.js", "**/*.mjs", "**/*.cjs"],
} as const;

export const DEFAULT_LANG: LangKey = "typescript";
