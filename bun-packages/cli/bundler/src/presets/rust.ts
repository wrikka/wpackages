import type { BunpackConfig } from "../types";

export const rustPreset: Partial<BunpackConfig> = {
	native: {
		napi: {
			crateDir: "native",
			release: true,
		},
	},
};
