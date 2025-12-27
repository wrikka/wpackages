// vite.config.ts

// vite.config.ts

import { presetWind as presetWind4 } from "unocss";
import { defineConfig } from "vite";
import wdev from "./src/index";
import { render } from "./src/render";

export default defineConfig(async () => {
	return {
		plugins: [
			wdev({
				check: {
					types: { config: true, scripts: "tsc --noEmit" },
					unused: { config: true, scripts: "bunx knip" },
				},
				deps: { config: true, scripts: "bunx depcheck" },
				format: {
					biome: { config: true, scripts: "biome format --write ." },
					dprint: { config: true, scripts: "dprint fmt" },
				},
				icon: ["mdi", "logos"],
				lint: {
					biome: {
						config: true,
						scripts: "biome check --write --unsafe .",
					},
					oxlint: { config: true, scripts: "oxlint --fix" },
				},
				render: await render(),
				styles: {
					unocss: {
						presets: [presetWind4()],
					},
				},
			}),
		],
	};
});
