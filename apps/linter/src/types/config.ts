/**
 * Configuration types
 */

import type { RuleConfig } from "./rule";

export type Config = {
	readonly extends?: string | readonly string[];
	readonly rules?: Record<string, RuleConfig>;
	readonly ignore?: readonly string[];
	readonly fix?: boolean;
	readonly maxWarnings?: number;
	readonly cache?: boolean;
	readonly cacheLocation?: string;
	readonly env?: {
		readonly browser?: boolean;
		readonly node?: boolean;
		readonly es2024?: boolean;
	};
	readonly globals?: Record<string, boolean>;
};
