// Imports
import { ConfigService } from "../services";
import type { Config } from "../types";

// Re-export from types and services
export type { Config, FileMapping, GitRemote } from "../types";
export { configSchema } from "../types";
export { CONFIG_PATH, ConfigService } from "../services";

// Aliases for convenience
export { ConfigService as DotfileConfigService };

// Helper functions for backward compatibility
export const loadDotfileConfig = async () => ConfigService.load();
export const saveDotfileConfig = (config: Config) => ConfigService.save(config);
