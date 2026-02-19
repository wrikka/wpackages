import type { BunpackConfig } from "../types";

export const cliPreset: Partial<BunpackConfig> = {
	target: "bun",
	format: ["esm"],
	dts: false,
};
