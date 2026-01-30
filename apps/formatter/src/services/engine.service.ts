import { Effect } from "effect";
import type { FormatterEngine } from "../types";
import { findUp } from "../utils";
import { ENGINE_CONFIG_FILES } from "../constant";

export const detectEngine = (cwd: string): Effect.Effect<Exclude<FormatterEngine, "auto">, never> =>
	Effect.sync(() => {
		const biomeConfig = findUp(cwd, ENGINE_CONFIG_FILES.biome);
		if (biomeConfig) return "biome";

		const dprintConfig = findUp(cwd, ENGINE_CONFIG_FILES.dprint);
		if (dprintConfig) return "dprint";

		return "dprint";
	});
