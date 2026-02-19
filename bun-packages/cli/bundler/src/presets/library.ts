import type { BunpackConfig } from "../types";

export const libraryPreset: Partial<BunpackConfig> = {
	format: ["esm", "cjs"],
	dts: true,
};
