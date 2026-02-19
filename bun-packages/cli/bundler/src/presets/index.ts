import type { BunpackConfig, Preset } from "../types";

type PresetLoader = () => Promise<Partial<BunpackConfig>>;

export const presets: Partial<Record<Preset, PresetLoader>> = {
	library: async () => (await import("./library")).libraryPreset,
	app: async () => (await import("./app")).appPreset,
	cli: async () => (await import("./cli")).cliPreset,
	react: async () => (await import("./react")).reactPreset,
	vue: async () => (await import("./vue")).vuePreset(),
	svelte: async () => (await import("./svelte")).sveltePreset(),
	rust: async () => (await import("./rust")).rustPreset,
	wasm: async () => (await import("./wasm")).wasmPreset,
};
