/**
 * @usage
 * This is an example of how to use the wvite plugin in your vite.config.ts
 */

import presetWind from "@unocss/preset-wind";
import { defineConfig } from "vite";
import wvite from "./index";

export default defineConfig({
	plugins: [
		wvite({
			deps: {
				scripts: "bunx depcheck",
				useDefaultConfig: true,
			},
			format: {
				biome: { scripts: "biome format --write .", useDefaultConfig: true },
				dprint: { scripts: "dprint fmt", useDefaultConfig: true },
			},
			icon: ["mdi", "logos"],
			lint: {
				biome: {
					scripts: "biome check --write --unsafe .",
					useDefaultConfig: true,
				},
				oxlint: { scripts: "oxlint --fix", useDefaultConfig: true },
			},
			prepare: {
				lefthook: {
					scripts: "lefthook install",
					useDefaultConfig: true,
				},
			},
			style: {
				presets: [presetWind()],
			},
		}),
	],
});
