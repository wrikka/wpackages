import type { FormatterEngine } from "../types";

export const DEFAULT_ENGINE: FormatterEngine = "auto";

export const SUPPORTED_ENGINES = ["auto", "dprint", "biome"] as const;

export const ENGINE_CONFIG_FILES = {
	biome: ["biome.json", "biome.jsonc"],
	dprint: ["dprint.json"],
} as const;
