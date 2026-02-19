import type { Config } from "tailwindcss";
import type { FontOptions } from "../types/fonts";
import type { UserOptions } from "../types/options";

export type ResolvedOptions = UserOptions & {
	preset: "wind4" | "react" | "vue" | "svelte";
	content: string[];
	root: string;
	fonts: FontOptions[];
	icons: string[];
	theme: NonNullable<Config["theme"]>;
	plugins: NonNullable<Config["plugins"]>;
};

// Default configuration
export const defaultConfig: UserOptions = {
	preset: "wind4",
	content: [],
	root: process.cwd(),
	theme: {},
	fonts: [],
	icons: [],
	plugins: [],
	darkMode: "media",
	cache: {
		enabled: true,
	},
	minify: false,
	stylingPlugins: [],
};

const presetContent: Record<NonNullable<UserOptions["preset"]>, string[]> = {
	wind4: [],
	react: ["src/**/*.{ts,tsx,js,jsx,html}"],
	vue: ["src/**/*.{vue,ts,tsx,js,jsx,html}"],
	svelte: ["src/**/*.{svelte,ts,tsx,js,jsx,html}"],
};

// In a real scenario, you would load a user's `styling.config.ts` file here.
// For now, we'll just merge the user options with the default.
export function loadConfig(userOptions: UserOptions): ResolvedOptions {
	const preset = (userOptions.preset ?? defaultConfig.preset ?? "wind4") as ResolvedOptions["preset"];
	return {
		...defaultConfig,
		...userOptions,
		preset,
		content: userOptions.content ?? defaultConfig.content ?? presetContent[preset] ?? [],
		root: userOptions.root ?? defaultConfig.root ?? process.cwd(),
		fonts: userOptions.fonts ?? defaultConfig.fonts ?? [],
		icons: userOptions.icons ?? defaultConfig.icons ?? [],
		theme: {
			...defaultConfig.theme,
			...userOptions.theme,
		},
		plugins: [...(defaultConfig.plugins ?? []), ...(userOptions.plugins ?? [])],
		cache: {
			...defaultConfig.cache,
			...userOptions.cache,
		},
		stylingPlugins: [...(defaultConfig.stylingPlugins ?? []), ...(userOptions.stylingPlugins ?? [])],
	};
}
