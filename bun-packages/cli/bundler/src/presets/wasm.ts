import type { BunpackConfig } from "../types";

export const wasmPreset: Partial<BunpackConfig> = {
	native: {
		napi: { skip: true },
		wasm: {
			crateDir: "native",
			outDir: "dist",
			target: "bundler",
			release: true,
		},
	},
};
