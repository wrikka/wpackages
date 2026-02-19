import type { Config } from "tailwindcss";

export interface ThemePreset {
	readonly name: string;
	readonly version: string;
	readonly description?: string;
	readonly author?: string;
	readonly license?: string;
	readonly homepage?: string;
	readonly repository?: string;
	readonly theme: Config["theme"];
	readonly plugins?: NonNullable<Config["plugins"]>;
	readonly cssVariables?: Record<string, string>;
	readonly shortcuts?: Record<string, string>;
	readonly rules?: Array<[RegExp, string | ((match: RegExpExecArray) => string | Record<string, string>)]>;
}

export interface ThemePresetOptions {
	readonly preset?: string;
	readonly presets?: string[];
	readonly presetPath?: string;
	readonly remotePresets?: boolean;
}
